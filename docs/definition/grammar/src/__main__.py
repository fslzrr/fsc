import sys
import os
from railroad import Diagram
from tokens import Boolean, Int, Float, String, List, Data, DataProps, DataProp, Lambda, TypedArgs, TypedArg

grammars = [
    ('Boolean', Boolean.grammar()),
    ("Int", Int.grammar()),
    ("Float", Float.grammar()),
    ("String", String.grammar()),
    ("List", List.grammar()),
    ("Data", Data.grammar()),
    ("DataProps", DataProps.grammar()),
    ("DataProp", DataProp.grammar()),
    ("Lambda", Lambda.grammar()),
    ("TypedArgs", TypedArgs.grammar()),
    ("TypedArg", TypedArg.grammar())
]

scriptDir = os.path.dirname(__file__)
path = '../output/'
outputDir = os.path.join(scriptDir, path)

for (name, grammar) in grammars:
    f = open(outputDir + name + ".svg", "w")
    diagram = Diagram(grammar)
    diagram.writeSvg(f.write)
