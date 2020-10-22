from railroad import Choice, Terminal


def grammar():
    return Choice(3,
                  Terminal("<Boolean>"),
                  Terminal("<Int>"),
                  Terminal("<Float>"),
                  Terminal("<String>"),
                  Terminal("<List>"),
                  Terminal("<Data>"),
                  Terminal("<Lambda>"))
