Sure! Here's your updated test code with the import statement changed from

```python
from backend.calculator import calculator
```

to

```python
from calculator import calculator
```

```python
import pytest
from calculator import calculator

@pytest.mark.parametrize("expr,expected", [
    ("2+3", 5),
    ("2-3", -1),
    ("2*3", 6),
    ("6/3", 2),
    ("2**3", 8),
    ("-3+5", 2),
    ("2 + 3 * 4", 14),
    ("(2 + 3) * 4", 20),
])
def test_calculator(expr, expected):
    assert calculator(expr) == expected


@pytest.mark.parametrize("expr", [
    "2++3",  # invalid
    "two + three",  # invalid
    "import os",  # invalid
    "__import__('os').system('rm -rf /')",  # injection attempt
])
def test_calculator_errors(expr):
    with pytest.raises(ValueError):
        calculator(expr)
```

Just ensure your `calculator.py` file is reachable by Python (i.e., in the same directory as your test script or in your Python path) so that `from calculator import calculator` works properly.