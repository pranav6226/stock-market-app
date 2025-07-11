import json
import os
from datetime import datetime

class SimpleLogger:
    def __init__(self, directory=None):
        # Default directory if not specified
        self.log_dir = directory or os.path.expanduser('~/.local/share/goose/sessions')
        os.makedirs(self.log_dir, exist_ok=True)

        # Log file named by timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.log_path = os.path.join(self.log_dir, f'{timestamp}.jsonl')

    def log(self, data):
        # Append data dict as json line
        with open(self.log_path, 'a') as f:
            f.write(json.dumps(data) + '\n')

# Usage example:
if __name__ == '__main__':
    logger = SimpleLogger()
    logger.log({'event': 'test log', 'status': 'success'})
