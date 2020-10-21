from railroad import Choice, Terminal


def grammar():
    return Choice(0, Terminal('True'), Terminal('False'))
