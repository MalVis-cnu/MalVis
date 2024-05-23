import argparse
import json
import socket
import traceback

import simmilarity
import clustering

def args_parsing():
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter)

    parser.add_argument('-i', dest='input_data', action='store',
                        help='input file path')
    
    parser.add_argument('--simmilarity-method', action='store',
                        help=f'select simmilarity method {list(simmilarity.valid_simmilarity_methods.keys())}')
    parser.add_argument('--simmilarity-option', action='append', nargs='*',
                        help='input simmilarity options [option_name option_value]*\n' +
                        'jaccard:\n' +
                        '\tngram [int]')
    
    parser.add_argument('--clustering-method', action='store',
                        help=f'select clustering method {list(clustering.valid_clustering_methods.keys())}')
    parser.add_argument('--clustering-option', action='append', nargs='*',
                        help='input clustering options [option_name option_value]*\n' +
                        'hierachical:\n' +
                        '\tn_cluster [int]\n' +
                        '\tdistance_threshold [int]\n' +
                        '\tlinkage [single, complete, average]\n'
                        'kmeans:\n' +
                        '\tk [int]\n' +
                        '\tmax_iteration [int]\n')

    return parser.parse_args()

def input_data_parsing(input_data):
    l = 1000 ###############
    data = []
    with open(input_data) as f:
        f.readline()
        for i in range(l):
            data.append(f.readline().split(',')[1:-1])
    
    return data

def option_parsing(option):
    if option:
        option = option[0]
        return {option[i]: option[i+1] for i in range(0,len(option),2)}




# def send_result(clustering_result, distance_matrix):
    # json_data = json.dumps(clustering_result)

    # server_address = '127.0.0.1'
    # server_port = 12345

    # s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # s.connect((server_address, server_port))
    # s.send(json_data.encode('utf-8'))
    # s.close()

# def send_error():
#     msg = traceback.format_exc()
    
#     server_address = '127.0.0.1'
#     server_port = 12345

#     s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#     s.connect((server_address, server_port))
#     s.send(msg.encode('utf-8'))
#     s.close()




def main(args):
    input_data = input_data_parsing(args.input_data)

    simmilarity_method = args.simmilarity_method
    if simmilarity_method not in simmilarity.valid_simmilarity_methods:
        print(f'select simmilarity method with {simmilarity.valid_simmilarity_methods.keys()}')
        exit(0)

    clustering_method = args.clustering_method
    if clustering_method not in clustering.valid_clustering_methods:
        print(f'select clustering method with {clustering.valid_clustering_methods.keys()}')
        exit(0)
    
    
    distance_matrix = simmilarity.get_simmilarity(input_data=input_data, simmilarity_method=simmilarity_method, option=option_parsing(args.simmilarity_option))

    clustering_result = clustering.do_clustering(distance_matrix=distance_matrix, clustering_method=clustering_method, option=option_parsing(args.clustering_option))
    # for i in clustering_result.items(): print(i)
    print(json.dumps(clustering_result))
    
    # send_result(clustering_result, distance_matrix)


# ###############################
#     while True:
#         try:
#             exec(input('>'))
#         except KeyboardInterrupt:
#             exit(0)
#         except:
#             import traceback
#             print(traceback.print_exc())
# ###############################


if __name__== '__main__':
    args = args_parsing()
    try:
        main(args)
    except:
        traceback.print_exc()
        # send_error()
