import argparse
import json

import similarity
import clustering

def args_parsing():
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter)

    parser.add_argument('-i', dest='input_data', action='store',
                        help='input file path')
    
    parser.add_argument('--similarity-method', action='store',
                        help=f'select similarity method {list(similarity.valid_similarity_methods.keys())}')
    parser.add_argument('--similarity-option', action='append', nargs='*',
                        help='input similarity options [option_name option_value]*\n' +
                        'jaccard:\n' +
                        '\tngram [int]\n' +
                        'cosine:\n' +
                        '\tngram [int]\n')
    
    parser.add_argument('--clustering-method', action='store',
                        help=f'select clustering method {list(clustering.valid_clustering_methods.keys())}')
    parser.add_argument('--clustering-option', action='append', nargs='*',
                        help='input clustering options [option_name option_value]*\n' +
                        'hierarchical:\n' +
                        '\tn_cluster [int]\n' +
                        '\tdistance_threshold [int]\n' +
                        '\tlinkage [single, complete, average]\n'
                        'kmeans:\n' +
                        '\tk [int]\n' +
                        '\tmax_iteration [int]\n')

    return parser.parse_args()

def input_data_parsing(input_data):
    l = 20 ###############
    data = []
    hash = []
    with open(input_data) as f:
        f.readline()
        for i in range(l):
            line = f.readline().split(',')[:-1]
            data.append(line[1:])
            hash.append(line[0])
    
    return data, hash

def option_parsing(option):
    if option:
        option = option[0]
        return {option[i]: option[i+1] for i in range(0,len(option),2)}




def main(args):
    input_data, hash = input_data_parsing(args.input_data)

    similarity_method = args.similarity_method
    if similarity_method not in similarity.valid_similarity_methods:
        print(f'select similarity method with {similarity.valid_similarity_methods.keys()}')
        exit(0)

    clustering_method = args.clustering_method
    if clustering_method not in clustering.valid_clustering_methods:
        print(f'select clustering method with {clustering.valid_clustering_methods.keys()}')
        exit(0)
    
    
    distance_matrix = similarity.get_similarity(input_data=input_data, similarity_method=similarity_method, option=option_parsing(args.similarity_option))

    clustering_result = clustering.do_clustering(distance_matrix=distance_matrix, clustering_method=clustering_method, option=option_parsing(args.clustering_option))
    clustering_result['hash'] = hash
    
    # for i in clustering_result.items(): print(i)
    print(json.dumps(clustering_result))



if __name__== '__main__':
    args = args_parsing()

    main(args)
