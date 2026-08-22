from app.services.transcription_service import transcribe_audio


audio_file ="test_audio/recording.ogg"

transcript = transcribe_audio(audio_file)

print("\n==============================")
print("TRANSCRIPT:")
print(transcript)
print("==============================")