# UX Research Assistant

## Setup
1. Clone repository, and change into folder
```
gh repo clone tmk1221/uxr_bot
cd uxr_bot
```

## 1 - Transcribe interviews (optional)
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

3. Install the following Python dependencies
```
pip install torch==2.0.0 torchvision==0.15.1 torchaudio==2.0.1 python-dotenv
```

4. Install the [WhisperX](https://github.com/m-bain/whisperX) (by Matthew Bain) with the following...
```
pip install git+https://github.com/m-bain/whisperx.git
```
You may also need to install ffmpeg, Rust, etc. See OpenAI instructions [here](https://github.com/openai/whisper#setup).

5. Create a free Hugging Face account [here](https://huggingface.co/join?next=%2Fsettings%2Ftokens).

6. Once you have a Hugging Face account, create an Access Token (read) [here](https://huggingface.co/settings/tokens).

7. Create a file named `.env` in the root directory of your project. In the file, paste in your token like so.

    <img src="./images/HF_Key.png" alt="Hugging Face API Key" width="80%" />

8. Finally, agree to the conditions of the following three models: [Segmentation](https://huggingface.co/pyannote/segmentation), [Voice Activity Detection](https://huggingface.co/pyannote/voice-activity-detection), [Speaker Diarization 3.0](https://huggingface.co/pyannote/speaker-diarization-3.0).


### Usage
1. Place .wav audio files into the 

You can chose between Whisper models of various sizes: "tiny.en", "base.en", "small.en", "medium.en", or "large-v2"


## 2a. Generate structured interview data

## 2b. Talk to transcripts
You can talk to specific transcripts directly from the command line. The command takes the following format.
```
node talk.js "name_of_transcript.txt" "put_your_question_here"
```

The first and second argument (node and talk.js) will always be the same.

The third argument is the name of the transcript (placed in quotes) located in the `./transcripts` directory.

Finally, the fourth argument is the question you want to "ask" the transcript (placed in quotes). The output will print to the command line.

Here is an actual example:
```
node talk.js "Alicia (tourist)_small.en.txt" "Tell me about your virtual tour experiences. And how did you hear about them?"
```
```
Based on the conversation, Speaker 00 found out about virtual tours through the London Meetup site. They joined a group called "Undercover France" which normally meets up in person but has moved their activities online due to the lockdown. Speaker 01 also mentioned joining a London Facebook page where they heard about live streams. Speaker 00 mentioned that the virtual tours they have experienced so far have included concerts, discussion groups, and book clubs.
```
