def write_2D_list_to_file(f, l, list_name):
    """f: file, l: 2D list, list_name: name of list"""
    f.write(list_name + ' = [\n')

    for row in l:
        f.write(' ' * 4 + '[')
        for col in row:
            f.write(str(col) + ', ')

        f.write('],\n')

    f.write(']\n')
