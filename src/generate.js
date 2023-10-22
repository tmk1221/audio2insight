import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { InMemoryDocstore } from 'langchain/stores/doc/in_memory';
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { loadQAStuffChain } from "langchain/chains";
import { config } from "dotenv";
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

config({ path: './.env' });

const openAIApiKey = process.env.OPENAI_API_KEY;

const transcriptsPath = "./transcripts";

// Function for processing a single file in transcripts directory
async function processFile(file, model_name, queries) {
  const vectorstore = new MemoryVectorStore(new OpenAIEmbeddings());
  const docstore = new InMemoryDocstore();
  const retriever = new ParentDocumentRetriever({
    vectorstore,
    docstore,
    parentSplitter: new RecursiveCharacterTextSplitter({
      chunkOverlap: 50,
      chunkSize: 2000,
    }),
    childSplitter: new RecursiveCharacterTextSplitter({
      chunkOverlap: 0,
      chunkSize: 50,
    }),
    childK: 5,
    parentK: 2,
  });

  const textLoader = new TextLoader(`./transcripts/${file}`);
  const parentDocuments = await textLoader.load();

  await retriever.addDocuments(parentDocuments);

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

  const results = {};

  for (const key in queries) {
    if (queries.hasOwnProperty(key)) {
      const query = queries[key];
      const relevantDocs = await retriever.getRelevantDocuments(query);
      const result = await chain.call({ input_documents: relevantDocs, question: query, prompt: prompt });

      results[key] = result.text;
      console.log(`✅ ${key} for ${file}`);
    }
  }
  return results;
}

// Read in variables from config file, and run processFile on each file in transcripts directory
fs.readFile("./config.json", "utf-8", async (err, data) => {
  if (err) {
    console.error('Error reading config file:', err);
    return;
  }

  const config = JSON.parse(data);
  const model_name = config.openai_model;
  const queries = config.discussion_guide;

  try {
    let files = await fs.promises.readdir(transcriptsPath);

    files = files.filter((fileName) => fileName.endsWith('.txt') && fileName !== '.gitkeep');
    
    const resultsArray = [];

    for (const file of files) {
      const result = await processFile(file, model_name, queries);
      resultsArray.push(result);
      console.log(`---${file} Completed!---`)
    }
    const time = new Date().toISOString().replace(/:/g, '-');
    const csvFilePath = `./output/interview_data_${time}.csv`;

    const questionKeys = Object.keys(queries);
    const questionNames = Object.values(queries);
    
    const columnNames = questionKeys.map((key, index) => {
      return {
        id: key,
        title: `${key}: ${questionNames[index]}`,
      };
    });
    
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'Filename', title: 'Interviews' },
        ...columnNames,
      ],
    });
    
    const dataToWrite = resultsArray.map((result, index) => ({
      Filename: files[index],
      ...result,
    }));

    // Write the data to the CSV file
    csvWriter.writeRecords(dataToWrite)
      .then(() => {
        console.log('CSV file has been written successfully.');
      })
      .catch((err) => {
        console.error('Error writing CSV file:', err);
      });

  } catch (err) {
    console.error('Error reading transcripts directory:', err);
  }
});