from railroad import OneOrMore, Terminal


def grammar():
    return OneOrMore(Terminal("<Digit>"))
