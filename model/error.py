import traceback

DEBUG = True

def print_and_exit(exitcode, string):
    if DEBUG:
        traceback.print_exc()
    print(f'exitcode: {exitcode}, {string}')
    exit(exitcode)