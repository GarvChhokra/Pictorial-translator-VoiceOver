import os
from chalice import Chalice
from dotenv import load_dotenv
import urllib.parse
import base64

from chalicelib.storage_service import StorageService
from chalicelib.recognition_service import RecognitionService
from chalicelib.translation_service import TranslationService
from chalicelib.reading_service import ReadingService

load_dotenv(dotenv_path='.env')

#####
# chalice app configuration
#####
app = Chalice(app_name='Capabilities')
app.debug = True

#####
# services initialization
#####
storage_location = os.getenv('STORAGE_NAME')
storage_service = StorageService(storage_location)
translation_service = TranslationService()
reading_service = ReadingService()


@app.route('/images', methods=['POST'], cors=True)
def upload_image():
    request = app.current_request
    data = request.json_body
    filename = data['filename']
    filebytes = base64.b64decode(data['filebytes'])

    result = storage_service.upload_file(filebytes, filename)

    if result:
        return {
            'fileId': result['fileId'],
            'fileUrl': result['fileUrl']
        }
    else:
        return {'error': 'Failed to upload the file'}, 500


@app.route('/images/{file_id}/translate-text', methods=['POST'], cors=True)
def recognize_text(file_id):
    request = app.current_request
    data = request.json_body
    fromLang = data['fromLang']
    toLang = data['toLang']
    recognition_service = RecognitionService(storage_service)
    file_id = urllib.parse.unquote(file_id)
    text_lines = recognition_service.detect_text(file_id)
    text = ' '.join(line['text'] for line in text_lines)
    result = translation_service.translate_text(text, fromLang, toLang)

    audio = reading_service.voice_over(result['translatedText'])
    audio_base64 = base64.b64encode(audio).decode('utf-8')

    res = {'audio': audio_base64, 'text': text, 'translation': result}
    return res
