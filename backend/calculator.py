def calculator(expression: str) -> float:
    """Evaluate a simple arithmetic expression safely."""
    import ast
    import operator as op

    # supported operators
    operators = {
        ast.Add: op.add,
        ast.Sub: op.sub,
        ast.Mult: op.mul,
        ast.Div: op.truediv,
        ast.Pow: op.pow,
        ast.BitXor: op.xor,
        ast.USub: op.neg,
    }

    def eval_expr(expr):
        if isinstance(expr, ast.Num):  # <number>
            return expr.n
        elif isinstance(expr, ast.BinOp):  # <left> <operator> <right>
            return operators[type(expr.op)](eval_expr(expr.left), eval_expr(expr.right))
        elif isinstance(expr, ast.UnaryOp):  # <operator> <operand> e.g., -1
            return operators[type(expr.op)](eval_expr(expr.operand))
        else:
            raise TypeError(f"Unsupported type: {type(expr)}")

    try:
        parsed_expr = ast.parse(expression, mode='eval').body
        return eval_expr(parsed_expr)
    except Exception as e:
        raise ValueError(f"Invalid expression: {expression}. Error: {str(e)}")

