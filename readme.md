# audio2insight
**audio2insight** is an open-source project that automates qualitative data analysis, and was built specifically for UX Researchers, Market Researchers, and Academics who run one-on-one, in-depth interviews.

As the name suggests, **audio2insight** covers the full analytical pipeline starting with audio files from interviews and ending with AI making sense of the data. First, audio files are converted into timestamped and speaker-labeled transcripts. Then the researcher can either talk to, and ask bespoke questions of, a specific transcript. Or, can run many transcripts through the entire discussion guide, which results in structured interview data for an entire study. 

In either case, OpenAI LLMs answer questions based on the specific information contained within your interviews. You can think of it like chatGPT, but with an awareness of your qualitative research data. This toolset is intended to speed up analysis by automating mundane data processing, and amplify human researchers in general.

Note: Installation and usage of **audio2insight** requires some familiarity with the command-line interface. I did my best to create a step-by-step guide for those who are not technically-minded.

**Get started by** cloning the repo, and changing into the folder:
```
gh repo clone tmk1221/uxr_bot
cd uxr_bot
```

## 1 - Transcribe interviews (optional)
Transcription converts your interview audio files into text transcripts. 

Note: The installation below is by far the most complex part of this entire project. You can skip all of #1 if you have another method for obtaining interview transcripts.

### Installation
These installation instructions are for MacOS. Install [Homebrew Package Manager](https://brew.sh/) if you don't already have it.

1. Install Python3.10 - this specific version is highly recommended for running the transcription model
    ```
    brew install python@3.10
    ```

2. Install `virtualenv` Python package manager, and create a virtual environment for Python3.10
    ```
    !pip install virtualenv
    python3.10 -m venv venv
    source venv/bin/activate
    ```

3. Install the following Python dependencies. Windows and Linux users please see [these alternatives](https://pytorch.org/get-started/previous-versions/#v200).
    ```
    pip install torch==2.0.0 torchvision==0.15.1 torchaudio==2.0.1 python-dotenv pyannote.audio
    ```

4. Install [WhisperX](https://github.com/m-bain/whisperX) (by Matthew Bain) with the following...
    
    ```
    pip install git+https://github.com/m-bain/whisperx.git@f137f31de66f79cb988184b2d4b227d97147d702
    ```

    We are downloading a Sep 25, 2023 release of WhisperX. I tried to download the latest version as of October 21, 2023; however, I ran into dependency errors with onnxruntime-gpu (required by Pyannote), which apparently doesn't support Mac GPUs.

    You may also need to install ffmpeg, Rust, etc. See OpenAI instructions [here](https://github.com/openai/whisper#setup).

5. Create a free Hugging Face account [here](https://huggingface.co/join?next=%2Fsettings%2Ftokens).

6. Once you have a Hugging Face account, create an Access Token (read) [here](https://huggingface.co/settings/tokens).

7. Create a file named `.env` in the root directory of your project. In the file, paste in your token like so.

    <img src="./images/hf_key.png" alt="Hugging Face API Key" width="80%" />

8. Finally, agree to the conditions of the following three models
    - [Segmentation](https://huggingface.co/pyannote/segmentation)
    - [Voice Activity Detection](https://huggingface.co/pyannote/voice-activity-detection)
    - [Speaker Diarization](https://huggingface.co/pyannote/speaker-diarization).


### Usage
1. Place .wav audio files from your user interviews in the `./raw_audio` folder.
    
    Often web meetings recordings will output video files, or another audio format like .mp3. There are free online converters for changing these files into .wav. [Convertio](https://convertio.co/) has been helpful for me.

2. Update the following variables in `config.json`
    1. `whisper_model`: The Whisper model used for transcription (see the models below)
        
        There are accuracy and speed tradeoffs. I recommend using `small.en`. With my 2020 Mac Mini CPU's, I achieved 2x speed and it was plenty accurate. "2x speed" meaning it takes about 30 minutes to transcribe an hour of audio.


        | Model Name          | Required VRAM  | Relative speed  |
        | ------------------- | -------------- | --------------- |
        | tiny.en             | ~1 GB          | ~32x            |
        | base.en             | ~1 GB          | ~16x            |
        | small.en            | ~2 GB          | ~6x             |
        | medium.en           | ~5 GB          | ~2x             |
        | large-v2            | ~10 GB         | 1x              |


    2. `number_of_speakers`: The number of speaker voices present in the audio
        
        This is needed because the final trancript is speaker-labeled. For example, in an in-depth interview, the number of speakers would be 2 - one for the moderator and one for the research participant.

    3. `device`: The hardware used for computation (either "cpu" or "cuda")
        
        I could only get "cpu" working on my Mac Mini. Aparently M1 GPUs are not supported by the model. Windows and Linux users should be able to take advantage of their local GPUs (to speed up processing) by changing `device` to "cuda".
 
    You can ignore the other variables in `./config.json` for now. These will be changed in later sections.

3. Run transcription - this will transcribe all .wav files in the `./raw_audio` folder
    ```
    python3 transcribe.py
    ```

    [OpenAI's Whisper](https://github.com/openai/whisper) (Speech Recognition Model), and some other open-source models, will download to your machine. These models are all run on your local hardware and are free of cost.

    The following warning messages get printed to my console after running transcribe. These can be disregarded. I don't have a technical reason for why, but the transcript quality 'speaks' for itself 😉.

    ```
    Lightning automatically upgraded your loaded checkpoint from v1.5.4 to v2.1.0. To apply the upgrade to your files permanently, run `python -m pytorch_lightning.utilities.upgrade_checkpoint ../.cache/torch/whisperx-vad-segmentation.bin`
    Model was trained with pyannote.audio 0.0.1, yours is 3.0.0. Bad things might happen unless you revert pyannote.audio to 0.x.
    Model was trained with torch 1.10.0+cu102, yours is 2.0.0. Bad things might happen unless you revert torch to 1.x.
    ```

4. Transcribed interviews are placed in the `./transcripts` folder, ready for the following AI toolsets.

## 2. AI Research Assistant
### Installation
Install [Node.js](https://nodejs.org/) (LTS) on your system if you haven't already.

1. Create an OpenAI account, and create an API key [here](https://platform.openai.com/account/api-keys).

2. If you haven't already, create a `.env` file in your project's root directory, and add the OpenAI API key to it, as shown below.

    <img src="./images/open_key.png" alt="OpenAI API Key" width="80%" />

3. Install Node dependencies.
    ```
    npm install ./src/
    ```

4. Update the `openai_model` variable in `./config.json` file. This is the OpenAI Large Language Model (LLM) used for all subsequent analyses.

    - Note: At the time of writing, the most common options are: "gpt-3.5-turbo" or "gpt-4". GPT-4 is a more powerful model, but will cost more to use. For up-to-date information about available models, see [OpenAI's Model Overview](https://platform.openai.com/docs/models/overview)

5. If you haven't done so already, add interview transcripts (must be .txt files) into the `./transcripts` folder. This is where the AI will access interview data.

    - Note: You can transcribe your audio with WhisperX, as detailed above; however, this is not required. If you already have trancsripts from another source then manually add them into the `./transcripts` folder.

### Usage
There are two ways the AI Research Assistant can be used. First, it can generate structured data for an entire study. It creates a table of user responses to each question in your discussion guide, for each user in your study.

The second way you can use the AI is to talk to a specific transcript. You can quickly ask a question of a specific transcript, and immediately get a response printed to the command-line.

#### Structured Interview Data 
1. Update the `discussion_guide` variable in the `./config.json` file. These questions should match the questions that were asked in the interviews, and which are present in the transcripts.

- Note: Phrase these questions in the way that the moderator asked them to the user. The AI will essentially ask these questions of every transcript in your `./transcripts` folder.

2. Run the generator bot
    ```
    node ./src/generate.js
    ```

    - Note: The AI's progress will get printed to your console as it asks each question of each transcript.

3. Find the structured interview data (.csv) in the `./output` folder. You can open the file with a spreadsheet application like Numbers or Excel for easy read-out.

#### Talk-To-Transcript
Talking to the transcript always follows the below format:
```
node ./src/talk.js "name_of_transcript.txt" "put_your_question_here"
```

- The first two arguments (`node ./src/talk.js`) never change.

- The third argument is the name of the transcript (placed in quotes) that you want to talk to. As always this transcript must be located in the `./transcripts` folder.

- Finally, the fourth argument is the question you want to ask the transcript (placed in quotes)

- The answer will be immediately printed to the console.

Here is a real-world example:
```
node ./src/talk.js "Alicia (tourist)_small.en.txt" "Tell me about your virtual tour experiences. And how did you hear about them?"
```
```
Based on the conversation, Speaker 00 found out about virtual tours through the London Meetup site. They joined a group called "Undercover France" which normally meets up in person but has moved their activities online due to the lockdown. Speaker 00 mentioned that the virtual tours they have experienced so far have included concerts, discussion groups, and book clubs.
```
