import whisperx
import time

def transcribe(audio_file, model_size, hf_auth, num_speakers=None):
    device = "cpu" 
    batch_size = 16
    compute_type = "int8"

    # 1. Transcribe with original whisper (batched)
    model = whisperx.load_model(model_size, device, compute_type=compute_type)

    audio = whisperx.load_audio(audio_file)
    result = model.transcribe(audio, batch_size=batch_size)

    # 2. Align whisper output
    model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
    result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    # 3. Assign speaker labels
    diarize_model = whisperx.DiarizationPipeline(use_auth_token=hf_auth, device=device)

    if num_speakers is None:
        diarize_segments = diarize_model(audio)
    else:
        diarize_segments = diarize_model(audio, min_speakers=num_speakers, max_speakers=num_speakers)

    result = whisperx.assign_word_speakers(diarize_segments, result)

    return result

def clean_transcript(input_text):
    data = input_text['segments']
    current_speaker = None
    current_start = None
    output = []

    for segment in data:
        speaker = segment['speaker']
        start = segment['start']
        end = segment['end']
        text = segment['text'].strip()

        if current_speaker is None:
            current_speaker = speaker
            current_start = start
            current_text = text
        elif current_speaker == speaker:
            current_text += ' ' + text
        else:
            # Convert start and end times to minute:seconds format
            current_start_min = int(current_start // 60)
            current_start_sec = int(current_start % 60)
            end_min = int(end // 60)
            end_sec = int(end % 60)

            current_start_min_sec = f'{current_start_min:02}:{current_start_sec:02}'
            end_min_sec = f'{end_min:02}:{end_sec:02}'
            output.append(f'{current_speaker} | {current_start_min_sec} - {end_min_sec}\n{current_text}')
            current_speaker = speaker
            current_start = start
            current_text = text

    # Convert the last segment's start and end times to minute:seconds format
    current_start_min = int(current_start // 60)
    current_start_sec = int(current_start % 60)
    end_min = int(end // 60)
    end_sec = int(end % 60)

    current_start_min_sec = f'{current_start_min:02}:{current_start_sec:02}'
    end_min_sec = f'{end_min:02}:{end_sec:02}'
    output.append(f'{current_speaker} | {current_start_min_sec} - {end_min_sec}\n{current_text}')

    return '\n'.join(output)


audio_files = [
    ("Barbara", "./raw_audio/Barbara_Virtual_Tourist.wav")
]

# You can include: "tiny.en", "base.en", "small.en", "medium.en"
models = ["small.en"]
hf_auth = "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"

for name, file_path in audio_files:
    for model in models:
        print(f"Running for {name} with {model} model")
        start_time = time.time()

        transcript = transcribe(file_path, model, hf_auth, num_speakers=2)

        final = clean_transcript(transcript)

        output_filename = f"./transcripts/{name}_{model}.txt"

        with open(output_filename, "w") as text_file:
            text_file.write(final)

        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"Elapsed time for {name} with {model}: {elapsed_time} seconds")