import json
import os
from datetime import datetime

class SimpleLogger:
    def __init__(self, log_dir=None):
        if log_dir is None:
            log_dir = os.path.expanduser('~/.local/share/goose/sessions')
        self.log_dir = log_dir
        os.makedirs(self.log_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.log_file_path = os.path.join(self.log_dir, f'{timestamp}.jsonl')
        self.file = open(self.log_file_path, 'a')

    def log(self, data):
        if isinstance(data, dict):
            line = json.dumps(data) + '\n'
        else:
            line = str(data) + '\n'
        self.file.write(line)
        self.file.flush()

    def close(self):
        if self.file:
            self.file.close()
            self.file = None


# Example usage:
# logger = SimpleLogger()
# logger.log({"event": "test", "message": "Hello world"})
# logger.close()
