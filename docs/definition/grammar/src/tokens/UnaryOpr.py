from railroad import Choice, Terminal


def grammar():
    return Choice(1,
                  Terminal("-"),
                  Terminal("!"))
