def _ngram(input_data, n):
    return [{tuple(i[j+k] for k in range(n)) for j in range(1, len(i)-n)} for i in input_data]


    

def get_simmilarity(simmilarity_method, input_data, option):
    return valid_simmilarity_methods[simmilarity_method](input_data, option)




def _get_jaccard(input_data, option):
    if 'ngram' in option:
        ngram = int(option['ngram'])
    else:
        ngram = 2

    length = len(input_data)
    input_data = _ngram(input_data, ngram)

    distance_matrix = [[0 for _ in range(length)] for __ in range(length)]

    for i in range(length):
        for j in range(length):
            calculated = 1 - _jaccard_score(input_data[i], input_data[j])
            distance_matrix[i][j] = calculated
            distance_matrix[j][i] = calculated

    return distance_matrix


def _jaccard_score(i1, i2):
    union = set()
    for i in i1:
        union.add(i)
    for i in i2:
        union.add(i)

    intersection = set()
    for i in i1:
        if i in i2:
            intersection.add(i)
    
    return len(intersection) / len(union)



valid_simmilarity_methods = {'jaccard': _get_jaccard}