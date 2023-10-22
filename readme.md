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

3. Install the following Python dependencies. Windows and Linux users please see [these alternatives](https://pytorch.org/get-started/previous-versions/#v200).
```
pip install torch==2.0.0 torchvision==0.15.1 torchaudio==2.0.1 python-dotenv pyannote.audio
```

4. Install the [WhisperX](https://github.com/m-bain/whisperX) (by Matthew Bain) with the following...
```
pip install git+https://github.com/m-bain/whisperx.git@f137f31de66f79cb988184b2d4b227d97147d702
```

- **Note:** We are downloading a Sep 25, 2023 release of WhisperX. I tried to download the latest version as of October 21, 2023; however, I ran into dependency errors with onnxruntime-gpu (required by Pyannote), which apparently doesn't support Mac GPUs.

    You may also need to install ffmpeg, Rust, etc. See OpenAI instructions [here](https://github.com/openai/whisper#setup).

5. Create a free Hugging Face account [here](https://huggingface.co/join?next=%2Fsettings%2Ftokens).

6. Once you have a Hugging Face account, create an Access Token (read) [here](https://huggingface.co/settings/tokens).

7. Create a file named `.env` in the root directory of your project. In the file, paste in your token like so.

    <img src="./images/HF_Key.png" alt="Hugging Face API Key" width="80%" />

8. Finally, agree to the conditions of the following three models: [Segmentation](https://huggingface.co/pyannote/segmentation), [Voice Activity Detection](https://huggingface.co/pyannote/voice-activity-detection), [Speaker Diarization](https://huggingface.co/pyannote/speaker-diarization).


### Usage
1. Place .wav audio files from your user interviews in the `./raw_audio` folder.

2. Update the following variables in `config.json`
    1. `whisper_model`: The Whisper model used for transcription (see the models below)
        - **Note:** There are accuracy and speed tradeoffs. I recommend `small.en`. Using my 2020 Mac Mini CPU's, I achieved 2x speed and it was plenty accurate. "2x speed" meaning it takes about 30 minutes to transcribe an hour of audio.


        | Model Name          | Required VRAM  | Relative speed  |
        | ------------------- | -------------- | --------------- |
        | tiny.en             | ~1 GB          | ~32x            |
        | base.en             | ~1 GB          | ~16x            |
        | small.en            | ~2 GB          | ~6x             |
        | medium.en           | ~5 GB          | ~2x             |
        | large-v2            | ~10 GB         | 1x              |


    2. `number_of_speakers`: The number of speaker voices present in the audio
        - **Note:**: This is needed because spoken words are assigned their respective speakers in the final transcript. So, for example, in an in-depth interview, the number of speakers would be 2 - one for the moderator and one for the research participant.

    3. `device`: The hardware used for computation (either "cpu" or "cuda")
        - **Note:** I could only get "cpu" working on my Mac Mini. Aparently M1 GPUs are not supported by the model. Windows and Linux users should be able to take advantage of their local GPUs (to speed up processing) by changing `device` to "cuda".

    4. You can ignore the other variables in `./config.json`. These will be updated in later sections.

3. Run the transcription script - this will transcribe all .wav files in the `./raw_audio` folder
```
python3 transcribe.py
```

4. Transcribed interviews are placed in the `./transcripts` folder, ready for the following AI toolsets.

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
