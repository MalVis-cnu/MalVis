def _silhouette_score(clusters, distance_matrix):
    scores = []
    for i in range(len(distance_matrix)):
        for k, cluster in enumerate(clusters):
            if i in cluster:
                k_me = k
        a = sum([distance_matrix[i][j] for j in clusters[k_me]]) / (len(clusters[k_me])-1)

        min_dist = 1
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
    


def do_clustering(distance_matrix, clustering_method, option):
    return valid_clustering_methods[clustering_method](distance_matrix, option)




def _hierachical_clustering(distance_matrix, option):
    from sklearn.cluster import AgglomerativeClustering
    if 'linkage' in option:
        linkage = option['linkage']
    else:
        linkage = 'single'

    model = AgglomerativeClustering(metric='precomputed', distance_threshold=0, n_clusters=None, linkage=linkage).fit(distance_matrix)
    return {'children'      : model.children_.tolist(),
            'distances'     : model.distances_.tolist(),
            'labels'        : model.labels_.tolist(),}

def _kmeans_clustering(distance_matrix, option):
    import random
    if 'k' in option:
        k = int(option['k'])
    else:
        k = 2
    if 'max_iteration' in option:
        max_iteration = int(option['max_iteration'])
    else:
        max_iteration = int(1e6)

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
                min_dist_with_center = 1
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
        
        score = _silhouette_score([clusters[i] +[centers[i]] for i in range(k)], distance_matrix)
        ############
        print(iter)
        print(centers, [clusters[i] + [centers[i]] for i in range(k)])
        print('score', _silhouette_score([clusters[i] + [centers[i]] for i in range(k)], distance_matrix))
        ############

        if s in did:
            break
        if iter >= max_iteration:
            print('iteration_exceed...')
            break
        did.add(s)
        centers = new_centers.copy()
        iter += 1

    return {'clusters':     [clusters[i] + [centers[i]] for i in range(k)],
            'centers':      centers}

    






    

valid_clustering_methods = {'hierachical': _hierachical_clustering,
                            'kmeans': _kmeans_clustering}