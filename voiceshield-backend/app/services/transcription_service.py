from faster_whisper import WhisperModel


# Load the Whisper model once when the application starts.
# "base" gives a good balance between speed and accuracy.
MODEL_SIZE = "base"

model = WhisperModel(
    MODEL_SIZE,
    device="cpu",
    compute_type="int8"
)


def transcribe_audio(audio_path: str) -> str:
    """
    Convert an audio file into text using Faster-Whisper.
    """

    segments, info = model.transcribe(
        audio_path,
        beam_size=5
    )

    transcript = " ".join(
        segment.text.strip()
        for segment in segments
    )

    return transcript.strip()