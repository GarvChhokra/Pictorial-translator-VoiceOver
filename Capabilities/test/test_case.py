import unittest
import base64

# Import the function we want to test
from Capabilities.chalicelib.storage_service import StorageService

storage_location = 'contentcen301183937.aws.ai'


class TestStorageService(unittest.TestCase):
    def test_if_stored_storage(self):
        storage_service = StorageService(storage_location)
        result = storage_service.get_storage_location()
        self.assertEqual(result, storage_location)

    def test_if_uploaded_file(self):
        filename = 'maxresdefault.jpg'
        with open(filename, 'rb') as file:
            filebytes = file.read()
        filebytes1 = base64.b64decode(filebytes)
        storage_service = StorageService('contentcen301183937.aws.ai')
        result = storage_service.upload_file(filebytes1, filename)
        self.assertEqual(result, {'fileId': filename, 'fileUrl': "http://" + 'contentcen301183937.aws.ai' + ".s3.amazonaws.com/" + filename})


if __name__ == '__main__':
    unittest.main()