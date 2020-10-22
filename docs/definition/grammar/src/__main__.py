from railroad import Diagram
import sys
import os
from tokens import Expr, UnaryExpr, BinaryExpr, TernaryExpr, UnaryOpr, BinaryOpr
from tokens import Literal, Boolean, Int, Float, String, List, Data, DataProps, DataProp, Lambda, Args

grammars = [
    ('Expr', Expr.grammar()),
    ('UnaryExpr', UnaryExpr.grammar()),
    ('BinaryExpr', BinaryExpr.grammar()),
    ('TernaryExpr', TernaryExpr.grammar()),
    ('UnaryOpr', UnaryOpr.grammar()),
    ('BinaryOpr', BinaryOpr.grammar()),
    ('Literal', Literal.grammar()),
    ('Boolean', Boolean.grammar()),
    ("Int", Int.grammar()),
    ("Float", Float.grammar()),
    ("String", String.grammar()),
    ("List", List.grammar()),
    ("Data", Data.grammar()),
    ("DataProps", DataProps.grammar()),
    ("DataProp", DataProp.grammar()),
    ("Lambda", Lambda.grammar()),
    ("Args", Args.grammar()),
]

scriptDir = os.path.dirname(__file__)
path = '../output/'
outputDir = os.path.join(scriptDir, path)

for (name, grammar) in grammars:
    f = open(outputDir + name + ".svg", "w")
    diagram = Diagram(grammar)
    diagram.writeSvg(f.write)
