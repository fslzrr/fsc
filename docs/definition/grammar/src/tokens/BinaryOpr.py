from railroad import Choice, Terminal


def grammar():
    return Choice(6,
                  Terminal("+"),
                  Terminal("-"),
                  Terminal("*"),
                  Terminal("/"),
                  Terminal("%"),
                  Terminal("=="),
                  Terminal("!="),
                  Terminal("<"),
                  Terminal(">"),
                  Terminal("<="),
                  Terminal(">="),
                  Terminal("++"))
