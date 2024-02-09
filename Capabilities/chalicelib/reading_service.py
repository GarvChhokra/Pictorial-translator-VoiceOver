import boto3


class ReadingService(object):
    def __init__(self):
        self.client = boto3.client('polly')

    def voice_over(self, text, voice_id='Joanna', output_format='mp3'):
        response = self.client.synthesize_speech(
            Text=text,
            OutputFormat=output_format,
            VoiceId=voice_id
        )
        audio_stream = response['AudioStream'].read()
        return audio_stream
