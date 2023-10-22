# UX Research Assistant

## 1 - Transcribe interviews (optional)
1. Place one or more .wav files of your in-depth interviews into the `./raw_audio` directory.

2. 

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
