# Algorithms & Data Structures Interview Prep

## Core Algorithms

- [ ] **Build the core dataset structures**
    - Store systems as a list
    - Create constant-time lookup by system name
    - Group systems by planet count, star count and distance band
    - Compare lists, maps and sets

- [ ] **Implement a reusable search function**
    - Exact and partial name matching
    - Numeric range searches
    - Multiple simultaneous conditions
    - Linear search and binary search
    - Indexed lookup using a map
    - Handle missing values

- [ ] **Implement a reusable sorting and ranking function**
    - Sort by name, distance, magnitude and planet count
    - Support ascending and descending order
    - Support multiple sort fields
    - Return the nearest, brightest or largest `k` results
    - Compare sorting, heaps and quickselect

- [ ] **Implement filtering, grouping and aggregation**
    - Filter systems using configurable predicates
    - Group by categorical or numeric buckets
    - Calculate counts, totals, averages, medians and percentiles
    - Produce summary statistics and histograms
    - Implement the operations using loops and reductions

- [ ] **Implement two-pointer and sliding-window searches**
    - Find systems within a distance interval
    - Find pairs matching a target
    - Find the densest region of a sorted dataset
    - Calculate rolling statistics
    - Compare against nested-loop solutions

## Spatial Data Structures

- [ ] **Convert astronomical coordinates into searchable positions**
    - Convert spherical coordinates into Cartesian `x`, `y`, `z`
    - Calculate physical distance between systems
    - Calculate angular separation
    - Handle Sol as the origin
    - Handle missing coordinates or distances

- [ ] **Implement a 2D spatial grid**
    - Divide the sky into cells
    - Insert systems into cells
    - Search a cell and its neighbours
    - Perform bounding-box and radius searches
    - Compare a dense matrix with a sparse map

- [ ] **Implement a 3D spatial grid**
    - Divide galaxy space into cubic cells
    - Insert systems using `x`, `y`, `z`
    - Search neighbouring cells
    - Find systems within jump range
    - Compare grid search against scanning every system

- [ ] **Implement nearest-neighbour search**
    - Brute-force nearest neighbour
    - Nearest `k` using sorting
    - Nearest `k` using a heap
    - Radius search
    - Basic k-d tree
    - Compare the performance of each approach

## Graph Algorithms

- [ ] **Generate a graph from the flat dataset**
    - Treat each system as a node
    - Connect systems within a maximum jump distance
    - Connect each system to its nearest `k` neighbours
    - Store distance as the edge weight
    - Produce edge-list, adjacency-list and adjacency-matrix representations
    - Compare sparse and dense representations

- [ ] **Implement graph traversal**
    - Breadth-first search
    - Recursive and iterative depth-first search
    - Determine whether two systems are connected
    - Find everything reachable from a system
    - Reconstruct a route
    - Find connected components and isolated systems
    - Detect cycles

- [ ] **Implement weighted route planning**
    - Build a priority queue using a binary heap
    - Implement Dijkstra
    - Implement A\* using straight-line distance
    - Reconstruct the resulting route
    - Support jump-distance, fuel and jump-count constraints
    - Compare shortest distance against fewest jumps
    - Compare visited-node counts and runtime

- [ ] **Implement bidirectional route planning**
    - Bidirectional BFS
    - Bidirectional Dijkstra
    - Optional bidirectional A\*
    - Compare against one-directional searches

- [ ] **Implement graph connectivity analysis**
    - Find articulation points
    - Find bridge edges
    - Find systems or routes whose removal disconnects the graph
    - Find strongly connected components for directed graphs
    - Explain practical uses of each result

- [ ] **Implement minimum network construction**
    - Build Union-Find with path compression
    - Detect whether adding an edge creates a cycle
    - Implement Kruskal
    - Implement Prim
    - Generate a minimum spanning tree or forest
    - Compare both algorithms

- [ ] **Implement all-pairs and alternative pathfinding**
    - Bellman-Ford
    - Floyd-Warshall on a small subset
    - Compare single-source and all-pairs algorithms
    - Explain when each algorithm is appropriate

## General Data Structures

- [ ] **Implement the standard interview structures**
    - Stack
    - Queue
    - Deque
    - Linked list
    - Hash table
    - Min-heap and max-heap
    - Priority queue
    - Trie for system-name autocomplete

- [ ] **Implement caching**
    - Build an LRU cache
    - Cache searches, spatial queries and routes
    - Evict the least recently used result
    - Invalidate results when graph settings change
    - Explain time and memory trade-offs

- [ ] **Implement a constrained selection problem**
    - Select the most systems under a fuel budget
    - Select the most planets under a travel-distance budget
    - Compare greedy and dynamic-programming solutions
    - Add memoisation
    - Explain why greedy solutions can fail

## Performance

- [ ] **Benchmark the competing approaches**
    - Array scan versus map lookup
    - Linear search versus binary search
    - Full sort versus heap versus quickselect
    - Brute-force spatial search versus grid versus k-d tree
    - Adjacency list versus adjacency matrix
    - Dijkstra versus A\*
    - Record runtime, memory use and visited-item counts

- [ ] **Handle a dataset too large to process at once**
    - Process records in batches
    - Maintain the best `k` results while streaming
    - Build indexes incrementally
    - Avoid unnecessary copies
    - Move expensive work away from the main UI thread

## React Integration

- [ ] **Build a searchable and sortable systems table**
    - Search, filters, sorting and pagination
    - Virtualisation for large datasets
    - Clear loading, empty and error states

- [ ] **Build a spatial and graph explorer**
    - Display systems on a 2D projection
    - Configure jump distance
    - Generate and display graph connections
    - Select start and destination systems

- [ ] **Build an algorithm visualiser**
    - Run BFS, Dijkstra and A\*
    - Animate visited systems and the final route
    - Display route cost, jumps, visited nodes and runtime
    - Add pause, resume, reset and cancellation

- [ ] **Structure the React application correctly**
    - Keep algorithms independent from components
    - Store only genuine application state
    - Derive filtered and sorted results
    - Use a reducer for complex controls
    - Run graph generation and pathfinding in a worker
    - Test algorithms separately from UI behaviour
