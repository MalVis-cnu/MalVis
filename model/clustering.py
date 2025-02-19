import error

def _silhouette_score(clusters, distance_matrix):
    scores = []
    for i in range(len(distance_matrix)):
        for k, cluster in enumerate(clusters):
            if i in cluster:
                k_me = k
        if len(clusters[k_me]) == 1:
            a = 1
        else:
            a = sum([distance_matrix[i][j] for j in clusters[k_me]]) / (len(clusters[k_me])-1)

        min_dist = 1
        min_idx = 0
        k_nearest = 0
        for idx in range(len(distance_matrix)):
            if idx in clusters[k_me]:
                continue
            if min_dist > distance_matrix[idx][i]:
                min_dist = distance_matrix[idx][i]
                min_idx = idx
        for idx, cluster in enumerate(clusters):
            if min_idx in cluster:
                k_nearest = idx
                break
        b = sum([distance_matrix[i][j] for j in clusters[k_nearest]]) / len(clusters[k_nearest])
        
        scores.append((b-a) / max(a,b))
    return sum(scores)/len(scores)
    
def _get_hirachical_clusters(children, n_cluster):
    l = len(children) + 1

    dic = {i:[] for i in range(l)}

    for i,(a,b) in enumerate(children):
        if i < l-n_cluster:
            if a < l and b < l:
                dic[i] += [a,b]
            elif a < l and b >= l:
                dic[i] += [a] + dic[b-l]
                dic[b-l] = []
            elif a >= l and b >= l:
                dic[i] += dic[a-l] + dic[b-l]
                dic[a-l] = []
                dic[b-l] = []
        
        else:
            if a < l:
                dic[i] = [a]
            elif a < l and b < l:
                dic[i] = [a, b]
    clusters = []
    for i in dic.values():
        if i:
            clusters.append(list(map(int, i)))
            
    return clusters


def do_clustering(distance_matrix, clustering_method, option):
    if clustering_method not in valid_clustering_methods:
        error.print_and_exit(41, f'unvalid similarity method {clustering_method}, choose with {list(valid_clustering_methods.keys())}')

    return valid_clustering_methods[clustering_method](distance_matrix, option)


def _get_center_for_hierarchical_clustering(clusters, distance_matrix):
    centers = []
    for cluster in clusters:
        dist_sum = [sum(list(map(lambda x: distance_matrix[i][x], cluster))) for i in cluster]
        
        min_val = min(dist_sum)
        for i, x in enumerate(cluster):
            if dist_sum[i] == min_val:
                centers.append(x)
                break
    return centers


def _hierarchical_clustering(distance_matrix, option):
    from sklearn.cluster import AgglomerativeClustering
    if 'linkage' in option:
        if option['linkage'] not in valid_linkage_options:
            error.print_and_exit(42, f'''unvalid linkage option {option['linkage']}, choose with {list(valid_linkage_options)}''')
        linkage = option['linkage']
    else:
        linkage = 'single'

    if 'n_cluster' in option:
        try:
            n_cluster = int(option['n_cluster'])
            if n_cluster < 1 or n_cluster > len(distance_matrix):
                raise Exception()
        except:
            error.print_and_exit(43, f'''unvalid n_cluster option {option['n_cluster']}, choose within 1 ~ {len(distance_matrix)} integer''')
    else:
        n_cluster = 1


    model = AgglomerativeClustering(metric='precomputed', distance_threshold=0, n_clusters=None, linkage=linkage).fit(distance_matrix)
    if n_cluster > 1:
        clusters = _get_hirachical_clusters(model.children_.tolist(), n_cluster)
        silhouette_score = _silhouette_score(clusters, distance_matrix)
    else:
        clusters = None
        silhouette_score = None
    
    ########################################
    # draw dendrogram with matploylib.pyplot
    ########################################
    # import numpy as np
    # from matplotlib import pyplot as plt
    # from scipy.cluster.hierarchy import dendrogram
    # def plot_dendrogram(model, **kwargs):
    #     # Create linkage matrix and then plot the dendrogram

    #     # create the counts of samples under each node
    #     counts = np.zeros(model.children_.shape[0])
    #     n_samples = len(model.labels_)
    #     for i, merge in enumerate(model.children_):
    #         current_count = 0
    #         for child_idx in merge:
    #             if child_idx < n_samples:
    #                 current_count += 1  # leaf node
    #             else:
    #                 current_count += counts[child_idx - n_samples]
    #         counts[i] = current_count

    #     linkage_matrix = np.column_stack(
    #         [model.children_, model.distances_, counts]
    #     ).astype(float)
    #     # Plot the corresponding dendrogram
    #     dendrogram(linkage_matrix, **kwargs)
    #     plt.title("Hierarchical Clustering Dendrogram")
    # # plot the top three levels of the dendrogram
    # # plot_dendrogram(model, truncate_mode=None, leaf_label_func=llf, orientation='left')
    # plot_dendrogram(model, truncate_mode=None, orientation='left')
    # # plot_dendrogram(model, truncate_mode="level", p=3)
    # plt.xlabel("distance")
    # plt.show()
    ########################################33

    return {'children'          : model.children_.tolist(),
            'distances'         : model.distances_.tolist(),
            'clusters'          : clusters,
            'centers'           : _get_center_for_hierarchical_clustering(clusters, distance_matrix),
            'silhouette_score'  : silhouette_score,
            }

def _kmeans_clustering(distance_matrix, option):
    import random
    if 'k' in option:
        try:
            k = int(option['k'])
            if k < 2 or k > len(distance_matrix):
                raise Exception()
        except:
            error.print_and_exit(44, f'''unvalid k option {option['k']}, choose within 2 ~ {len(distance_matrix)} integer''')
    else:
        k = 2

    if 'max_iteration' in option:
        try:
            max_iteration = int(option['max_iteration'])
            if max_iteration < 1 or max_iteration > 100_000:
                raise Exception()
        except:
            error.print_and_exit(45, f'''unvalid max_iteration {option['max_iteration']}, choose within 1 ~ 100,000 integer''')
    else:
        max_iteration = int(100)

    l = list(range(len(distance_matrix)))
    centers = random.sample(l, k)

    did = set()
    iter = 0
    while True:
        clusters = [[] for _ in range(k)]
        
        for i in range(len(distance_matrix)):
            if i in centers:
                continue
            else:
                min_dist_with_center = 2
                center_idx = 0
                for j, c in enumerate(centers):
                    if min_dist_with_center > distance_matrix[c][i]:
                        center_idx = j
                        min_dist_with_center = distance_matrix[c][i]
                clusters[center_idx].append(i)
        
        new_centers = []
        for idx, cluster in enumerate(clusters):
            cluster += [centers[idx]]
            min_avg_idx = 0
            min_avg = 1
            for i in cluster:
                avg = sum([distance_matrix[i][j] for j in cluster]) / len(cluster)
                if min_avg > avg:
                    min_avg_idx = i
                    min_avg = avg
            new_centers.append(min_avg_idx)
        
        s = str(new_centers)

        if s in did:
            break
        if iter >= max_iteration:
            break
        did.add(s)
        centers = new_centers.copy()
        iter += 1

    return {'clusters':         [clusters[i] for i in range(k)],
            'centers':          centers,
            'silhouette_score': _silhouette_score([clusters[i] + [centers[i]] for i in range(k)], distance_matrix),
            }

    






    

valid_clustering_methods = {'hierarchical': _hierarchical_clustering,
                            'kmeans': _kmeans_clustering}
valid_linkage_options = {'single', 'complete', 'average'}
