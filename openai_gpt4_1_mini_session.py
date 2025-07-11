# This file represents a simple session starter for OpenAI GPT-4.1-mini model

class OpenAI_GPT4_1_Mini_Session:
    def __init__(self):
        self.model_name = "gpt-4.1-mini"
        self.active = False

    def start_session(self):
        self.active = True
        return f"Session started with model {self.model_name}."

    def stop_session(self):
        self.active = False
        return f"Session stopped for model {self.model_name}."

# Example usage if this were to be run as a script (not required to be run, just illustrative):
if __name__ == "__main__":
    session = OpenAI_GPT4_1_Mini_Session()
    print(session.start_session())
