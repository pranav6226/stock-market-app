from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.calculator import calculator

app = FastAPI()

class CalcRequest(BaseModel):
    expression: str

class CalcResponse(BaseModel):
    result: float

@app.post("/calculate", response_model=CalcResponse)
def calculate_endpoint(request: CalcRequest):
    try:
        result = calculator(request.expression)
        return CalcResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
