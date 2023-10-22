import * as uuid from "uuid";

import { MultiVectorRetriever } from "langchain/retrievers/multi_vector";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import fs from 'fs';
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { PromptTemplate } from "langchain/prompts";
import { loadQAStuffChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { InMemoryStore } from "langchain/storage/in_memory";
import { config } from "dotenv";

config();

const openAIApiKey = process.env.OPENAI_API_KEY;

const transcriptName = process.argv[2];

let model_name
fs.readFile("../config.json", "utf-8", async (err, data) => {
    if (err) {
      console.error('Error reading config file:', err);
      return;
    }
  
    const config = JSON.parse(data);
    model_name = config.model;
});

const textLoader = new TextLoader(`../transcripts/${transcriptName}`);
const parentDocuments = await textLoader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 50,
});

const docs = await splitter.splitDocuments(parentDocuments);

const idKey = "doc_id";
const docIds = docs.map((_) => uuid.v4());

const childSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});

const subDocs = [];
for (let i = 0; i < docs.length; i += 1) {
  const childDocs = await childSplitter.splitDocuments([docs[i]]);
  const taggedChildDocs = childDocs.map((childDoc) => {
    // eslint-disable-next-line no-param-reassign
    childDoc.metadata[idKey] = docIds[i];
    return childDoc;
  });
  subDocs.push(...taggedChildDocs);
}

const keyValuePairs = docs.map((doc, i) => [
    docIds[i],
    doc,
]);
  
// The docstore to use to store the original chunks
const docstore = new InMemoryStore();
await docstore.mset(keyValuePairs);

const vectorstore = await HNSWLib.fromDocuments(
    subDocs,
    new OpenAIEmbeddings()
);

const retriever = new MultiVectorRetriever({
  vectorstore,
  docstore,
  idKey,
  childK: 5,
  parentK: 2,
});

const query = process.argv[3];

// Retriever returns larger result
const relevantDocs = await retriever.getRelevantDocuments(query);

const model = new OpenAI({
    modelName: model_name,
    temperature: 0,
    openAIApiKey: openAIApiKey
  });

const template = `Use the following information from an in-depth market research interview. Give a detailed answer to the question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
{context}
Question: {question}
Detailed answer:`;

const prompt = PromptTemplate.fromTemplate(template);
const chain = loadQAStuffChain(model);
const result = await chain.call({ input_documents: relevantDocs, question: query, prompt: prompt });

console.log(result.text);