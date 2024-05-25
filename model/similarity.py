def _ngram(input_data, n):
    return [{tuple(i[j+k] for k in range(n)) for j in range(1, len(i)-n)} for i in input_data]


    

def get_similarity(similarity_method, input_data, option):
    return valid_similarity_methods[similarity_method](input_data, option)


def _get_cosine(input_data, option):
    if 'ngram' in option:
        ngram = int(option['ngram'])
    else:
        ngram = 2

    length = len(input_data)
    input_data = _ngram(input_data, ngram)

    distance_matrix = [[0 for _ in range(length)] for __ in range(length)]

    for i in range(length):
        for j in range(length):
            calculated = 1 - _coinse_score(input_data[i], input_data[j])
            distance_matrix[i][j] = calculated
            distance_matrix[j][i] = calculated
            
    return distance_matrix

def _coinse_score(i1, i2):
    import math
    vec_i1 = {}
    vec_i2 = {}

    for i in i1:
        if i in vec_i1:
            vec_i1[i] += 1
        else:
            vec_i1[i] = 1
    for i in i2:
        if i in vec_i2:
            vec_i2[i] += 1
        else:
            vec_i2[i] = 1
    
    l2_norm_i1 = math.sqrt(sum([i*i for i in vec_i1.values()]))
    l2_norm_i2 = math.sqrt(sum([i*i for i in vec_i2.values()]))

    i1_dot_i2 = sum([vec_i1[i] * vec_i2[i] if i in vec_i2 else 0 for i in vec_i1.keys()])
    
    cosine_similarity = i1_dot_i2 / (l2_norm_i1 * l2_norm_i2)
    
    if cosine_similarity < 0:
        cosine_similarity = 0
        
    return cosine_similarity




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



valid_similarity_methods = {'jaccard': _get_jaccard,
                             'cosine':  _get_cosine}