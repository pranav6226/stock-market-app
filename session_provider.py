# session_provider.py

class SessionProvider:
    def __init__(self):
        self.session_active = False
        self.provider = None

    def start_session(self, provider_name):
        # For this simple implementation, we just set the provider name and active flag
        self.session_active = True
        self.provider = provider_name
        return f"Session started with provider: {provider_name}"

    def end_session(self):
        self.session_active = False
        self.provider = None
        return "Session ended"
