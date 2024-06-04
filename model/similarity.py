import error

def _ngram(input_data, n):
    return [[str( tuple( i[j+k] for k in range(n) ) ) for j in range(1, len(i)-n)] for i in input_data]


    

def get_similarity(similarity_method, input_data, option):
    if similarity_method not in valid_similarity_methods:
        error.print_and_exit(21, f'unvalid similarity method {similarity_method}, choose with {list(valid_similarity_methods.keys())}')
    
    return valid_similarity_methods[similarity_method](input_data, option)


def _get_cosine(input_data, option):
    if 'ngram' in option:
        min_length = min( [len(i) for i in input_data] )
        try:
            ngram = int(option['ngram'])
            if ngram < 2 or ngram > min_length:
                raise Exception()
        except:
            error.print_and_exit(22, f'''unvalid ngram option {option['ngram']}, choose within 2 ~ {min_length} integer''')
    else:
        ngram = 2

    length = len(input_data)
    input_data = _ngram(input_data, ngram)

    distance_matrix = [[0 for _ in range(length)] for __ in range(length)]
    similar_sequence_matrix = [[0 for _ in range(length)] for __ in range(length)]

    for i in range(length):
        for j in range(length):
            calculated = 1 - _coinse_score(input_data[i], input_data[j])
            distance_matrix[i][j] = calculated
            distance_matrix[j][i] = calculated
            
            similar_sequence = set(input_data[i]).intersection(set(input_data[j]))
            similar_sequence = list(map(str, similar_sequence))
            similar_sequence_matrix[i][j] = similar_sequence
            similar_sequence_matrix[j][i] = similar_sequence

    return distance_matrix, similar_sequence_matrix

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
        min_length = min( [len(i) for i in input_data] )
        try:
            ngram = int(option['ngram'])
            if ngram < 2 or ngram > min_length:
                raise Exception()
        except:
            error.print_and_exit(22, f'''unvalid ngram option {option['ngram']}, choose within 2 ~ {min_length} integer''')
    else:
        ngram = 2

    length = len(input_data)
    input_data = _ngram(input_data, ngram)

    distance_matrix = [[0 for _ in range(length)] for __ in range(length)]
    similar_sequence_matrix = [[0 for _ in range(length)] for __ in range(length)]

    for i in range(length):
        for j in range(length):
            calculated = 1 - _jaccard_score(input_data[i], input_data[j])
            distance_matrix[i][j] = calculated
            distance_matrix[j][i] = calculated
            
            similar_sequence = set(input_data[i]).intersection(set(input_data[j]))
            similar_sequence = list(map(str, similar_sequence))
            similar_sequence_matrix[i][j] = similar_sequence
            similar_sequence_matrix[j][i] = similar_sequence

    return distance_matrix, similar_sequence_matrix

def _jaccard_score(i1, i2):
    i1 = set(i1)
    i2 = set(i2)
    intersection = i1.intersection(i2)
    union = i2.union(i2)
    return len(intersection) / len(union)


valid_similarity_methods = {'jaccard': _get_jaccard,
                            'cosine':  _get_cosine}