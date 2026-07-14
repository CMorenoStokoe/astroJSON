## Core Algorithms

---

## 1. Build the Core Dataset Structures

### 1.1 Create a System Lookup Map

**File:** `create-system-map.js`

Given an array of stellar systems, create a lookup structure where each system can be retrieved by `sy_name`.

#### Input

```js
[
	{ sy_name: 'Sol', sy_pnum: 8, sy_snum: 1, sy_dist: 0 },
	{ sy_name: 'Proxima Centauri', sy_pnum: 1, sy_snum: 3, sy_dist: 1.301 }
]
```

#### Output

```js
Map {
	'Sol' => { sy_name: 'Sol', ... },
	'Proxima Centauri' => { sy_name: 'Proxima Centauri', ... }
}
```

#### Requirements

* Return a `Map`
* Use `sy_name` as the key
* Preserve the complete system object
* Decide how duplicate names should be handled
* Ignore or reject rows with missing names
* Do not mutate the input array

#### Example

```js
const systemsByName = createSystemMap(systems)

systemsByName.get('Sol')
// { sy_name: 'Sol', sy_pnum: 8, ... }
```

#### Target Complexity

* Build time: `O(n)`
* Lookup time: `O(1)` average
* Space: `O(n)`

---

### 1.2 Create a Unique System Name Set

**File:** `create-system-name-set.js`

Given an array of systems, return a set containing every unique valid system name.

#### Input

```js
[
	{ sy_name: 'Sol' },
	{ sy_name: 'Sirius' },
	{ sy_name: 'Sol' },
	{ sy_name: null }
]
```

#### Output

```js
Set { 'Sol', 'Sirius' }
```

#### Requirements

* Remove duplicate names
* Ignore `null`, `undefined` and empty names
* Preserve original casing
* Do not mutate the input

#### Follow-up

Add optional case-insensitive deduplication:

```js
createSystemNameSet(systems, {
	caseInsensitive: true
})
```

#### Target Complexity

* Time: `O(n)`
* Space: `O(n)`

---

### 1.3 Group Systems by Planet Count

**File:** `group-by-planet-count.js`

Group systems according to `sy_pnum`.

#### Input

```js
[
	{ sy_name: 'Sol', sy_pnum: 8 },
	{ sy_name: 'Kepler-90', sy_pnum: 8 },
	{ sy_name: 'Proxima Centauri', sy_pnum: 1 }
]
```

#### Output

```js
Map {
	8 => [
		{ sy_name: 'Sol', sy_pnum: 8 },
		{ sy_name: 'Kepler-90', sy_pnum: 8 }
	],
	1 => [
		{ sy_name: 'Proxima Centauri', sy_pnum: 1 }
	]
}
```

#### Requirements

* Return a `Map<number, System[]>`
* Preserve input order inside each group
* Place missing planet counts into a separate group or ignore them
* Do not mutate system objects

#### Target Complexity

* Time: `O(n)`
* Space: `O(n)`

---

### 1.4 Group Systems by Distance Band

**File:** `group-by-distance-band.js`

Group systems into fixed-width distance bands.

#### Function Signature

```js
groupByDistanceBand(systems, bandSize)
```

#### Input

```js
const systems = [
	{ sy_name: 'A', sy_dist: 2 },
	{ sy_name: 'B', sy_dist: 7 },
	{ sy_name: 'C', sy_dist: 12 }
]

groupByDistanceBand(systems, 5)
```

#### Output

```js
Map {
	'0-5' => [{ sy_name: 'A', sy_dist: 2 }],
	'5-10' => [{ sy_name: 'B', sy_dist: 7 }],
	'10-15' => [{ sy_name: 'C', sy_dist: 12 }]
}
```

#### Requirements

* `bandSize` must be greater than zero
* Place each system into exactly one band
* Ignore or separately group missing distances
* Define how exact boundaries behave
* Support floating-point distances

#### Target Complexity

* Time: `O(n)`
* Space: `O(n)`

---

### 1.5 Compare Array, Map and Set Lookups

**File:** `compare-dataset-structures.js`

Create an array, map and set from the same dataset, then compare their behaviour.

#### Tasks

* Find a system by name using an array
* Find the same system using a map
* Test whether a name exists using a set
* Measure lookup time across repeated searches
* Explain which structure is most appropriate for:

  * Ordered iteration
  * Constant-time lookup
  * Uniqueness checks
  * Grouping
  * Sorting

#### Expected Discussion

| Structure | Typical use                |         Lookup |
| --------- | -------------------------- | -------------: |
| Array     | Ordered data and iteration |         `O(n)` |
| Map       | Keyed lookup               | `O(1)` average |
| Set       | Membership and uniqueness  | `O(1)` average |

---

## 2. Implement Search Functions

### 2.1 Exact System Name Search

**File:** `exact-name-search.js`

Return the first system whose name exactly matches a query.

#### Function Signature

```js
findSystemByName(systems, query)
```

#### Input

```js
findSystemByName(systems, 'Sol')
```

#### Output

```js
{ sy_name: 'Sol', ... }
```

Return `null` when no match exists.

#### Requirements

* Use linear search
* Match the complete name
* Do not mutate the dataset
* Handle an empty array
* Handle an empty query
* Decide whether matching should be case-sensitive

#### Target Complexity

* Time: `O(n)`
* Space: `O(1)`

---

### 2.2 Partial System Name Search

**File:** `partial-name-search.js`

Return every system whose name contains a query string.

#### Function Signature

```js
searchSystemsByName(systems, query)
```

#### Input

```js
searchSystemsByName(systems, 'kepler')
```

#### Output

```js
[
	{ sy_name: 'Kepler-22' },
	{ sy_name: 'Kepler-90' },
	{ sy_name: 'Kepler-186' }
]
```

#### Requirements

* Match case-insensitively
* Match any part of the name
* Preserve dataset order
* Return an empty array when no match exists
* Ignore systems with missing names
* Trim leading and trailing query whitespace

#### Follow-up

Support search modes:

```js
{
	mode: 'contains' | 'startsWith' | 'exact'
}
```

#### Target Complexity

* Time: `O(n × m)`
* Space: `O(k)`

Where:

* `n` is the number of systems
* `m` is the average name length
* `k` is the number of matches

---

### 2.3 Numeric Range Search

**File:** `numeric-range-search.js`

Return systems whose selected numeric field falls inside a range.

#### Function Signature

```js
searchNumericRange(systems, field, min, max)
```

#### Input

```js
searchNumericRange(systems, 'sy_dist', 0, 10)
```

#### Output

```js
[
	{ sy_name: 'Sol', sy_dist: 0 },
	{ sy_name: 'Sirius', sy_dist: 2.64 }
]
```

#### Requirements

* Include both boundaries
* Support fields such as:

  * `sy_dist`
  * `sy_pnum`
  * `sy_snum`
  * `sy_vmag`
  * `sy_gaiamag`
* Ignore missing and non-numeric values
* Throw or return an error when `min > max`
* Do not mutate the input

#### Follow-up

Support exclusive boundaries:

```js
{
	includeMin: false,
	includeMax: true
}
```

#### Target Complexity

* Time: `O(n)`
* Space: `O(k)`

---

### 2.4 Multi-Condition Search

**File:** `multi-condition-search.js`

Return systems matching several simultaneous conditions.

#### Function Signature

```js
searchSystems(systems, criteria)
```

#### Example Criteria

```js
{
	name: 'kepler',
	minDistance: 100,
	maxDistance: 1000,
	minPlanetCount: 2,
	maxMagnitude: 12,
	circumbinary: false
}
```

#### Requirements

* Every specified condition must match
* Unspecified conditions must be ignored
* Support partial name matching
* Support numeric minimums and maximums
* Support boolean fields
* Handle missing data safely
* Preserve input order

#### Example

```js
searchSystems(systems, {
	minPlanetCount: 3,
	maxDistance: 500
})
```

#### Follow-up

Support `AND` and `OR` search modes.

```js
searchSystems(systems, criteria, {
	mode: 'AND'
})
```

#### Target Complexity

* Time: `O(n × c)`
* Space: `O(k)`

Where `c` is the number of active conditions.

---

### 2.5 Binary Search by Distance

**File:** `binary-search-distance.js`

Given systems already sorted by `sy_dist`, find a system with a target distance.

#### Function Signature

```js
binarySearchDistance(sortedSystems, target)
```

#### Input

```js
[
	{ sy_name: 'A', sy_dist: 1 },
	{ sy_name: 'B', sy_dist: 4 },
	{ sy_name: 'C', sy_dist: 9 }
]
```

Target:

```js
4
```

#### Output

```js
{ sy_name: 'B', sy_dist: 4 }
```

#### Requirements

* Use binary search
* Do not call `.find`
* Do not sort inside the function
* Return `null` when no match exists
* Handle an empty dataset
* Document that the input must already be sorted

#### Target Complexity

* Time: `O(log n)`
* Space: `O(1)` iteratively

---

### 2.6 Find the First System Beyond a Distance

**File:** `lower-bound-distance.js`

Return the first system whose distance is greater than or equal to a target.

#### Input

```js
const systems = [
	{ sy_name: 'A', sy_dist: 1 },
	{ sy_name: 'B', sy_dist: 4 },
	{ sy_name: 'C', sy_dist: 9 }
]

findFirstSystemAtDistance(systems, 5)
```

#### Output

```js
{ sy_name: 'C', sy_dist: 9 }
```

#### Requirements

* Use a modified binary search
* Return the first qualifying result
* Return `null` when every system is below the target
* Handle duplicate distances correctly

#### Target Complexity

* Time: `O(log n)`
* Space: `O(1)`

---

### 2.7 Indexed System Search

**File:** `indexed-system-search.js`

Build a name index once, then perform repeated constant-time lookups.

#### Function Signature

```js
const index = buildSystemIndex(systems)
const result = index.get('Sol')
```

#### Requirements

* Build the index in `O(n)`
* Retrieve systems in `O(1)` average time
* Decide how duplicate names are handled
* Compare repeated indexed lookup against repeated linear search
* Explain when index construction is worth the memory cost

---

## 3. Implement Sorting and Ranking

### 3.1 Generic Single-Field Sort

**File:** `sort-systems-by-field.js`

Sort systems by a selected field.

#### Function Signature

```js
sortSystemsByField(systems, field, direction)
```

#### Example

```js
sortSystemsByField(systems, 'sy_dist', 'ascending')
```

#### Requirements

* Support numeric and string fields
* Support ascending and descending order
* Place missing values consistently
* Return a new array
* Do not mutate the input
* Preserve stable ordering for equal values where possible

#### Target Complexity

* Time: `O(n log n)`
* Space: depends on implementation

---

### 3.2 Multi-Field Sort

**File:** `multi-field-sort.js`

Sort using several rules in priority order.

#### Example

```js
sortSystems(systems, [
	{ field: 'sy_pnum', direction: 'descending' },
	{ field: 'sy_dist', direction: 'ascending' },
	{ field: 'sy_name', direction: 'ascending' }
])
```

#### Expected Behaviour

* Systems with more planets appear first
* Equal planet counts are sorted by distance
* Equal distances are sorted by name

#### Requirements

* Apply sort rules in order
* Support strings and numbers
* Handle missing values
* Do not mutate the original array

#### Target Complexity

* Time: `O(n log n × r)`

Where `r` is the number of sort rules.

---

### 3.3 Find the Nearest `k` Systems by Sorting

**File:** `top-k-by-sorting.js`

Return the nearest `k` valid systems.

#### Function Signature

```js
findNearestKBySorting(systems, k)
```

#### Input

```js
findNearestKBySorting(systems, 3)
```

#### Output

```js
[
	{ sy_name: 'Sol', sy_dist: 0 },
	{ sy_name: 'Proxima Centauri', sy_dist: 1.301 },
	{ sy_name: 'Alpha Centauri', sy_dist: 1.347 }
]
```

#### Requirements

* Ignore missing distances
* Return at most `k` systems
* Handle `k <= 0`
* Handle `k > systems.length`
* Do not mutate the input

#### Target Complexity

* Time: `O(n log n)`
* Space: `O(n)`

---

### 3.4 Find the Nearest `k` Systems Using a Heap

**File:** `top-k-with-heap.js`

Return the nearest `k` systems without fully sorting the dataset.

#### Requirements

* Maintain a max-heap of size `k`
* Add systems one at a time
* Remove the farthest retained system when necessary
* Ignore missing distances
* Return the final results ordered by distance

#### Target Complexity

* Time: `O(n log k)`
* Space: `O(k)`

#### Interview Discussion

Explain why this is better than full sorting when:

```text
k << n
```

---

### 3.5 Find the `k`th Nearest System with Quickselect

**File:** `quickselect-distance.js`

Return the system that would appear at position `k` if all systems were sorted by distance.

#### Function Signature

```js
quickselectDistance(systems, k)
```

#### Requirements

* Implement partitioning
* Do not fully sort the dataset
* Handle duplicate distances
* Validate `k`
* Decide whether mutation is allowed
* Provide a non-mutating wrapper if the core algorithm mutates

#### Target Complexity

* Average time: `O(n)`
* Worst-case time: `O(n²)`
* Space: `O(1)` or `O(log n)`, depending on implementation

---

### 3.6 Rank Systems by Multiple Metrics

**File:** `rank-systems.js`

Calculate a ranking score from multiple properties.

#### Example Score

```js
score =
	planetCountWeight * sy_pnum -
	distanceWeight * sy_dist -
	magnitudeWeight * sy_vmag
```

#### Requirements

* Accept configurable weights
* Handle missing values
* Return systems with calculated scores
* Sort highest score first
* Preserve original system data
* Explain why the scoring formula may require normalisation

#### Follow-up

Normalise each metric before combining them.

---

## 4. Implement Filtering, Grouping and Aggregation

### 4.1 Generic Predicate Filter

**File:** `filter-systems.js`

Return every system satisfying a supplied predicate.

#### Function Signature

```js
filterSystems(systems, predicate)
```

#### Example

```js
filterSystems(
	systems,
	system => system.sy_pnum >= 3 && system.sy_dist < 100
)
```

#### Requirements

* Preserve input order
* Return a new array
* Do not mutate the original dataset
* Handle an empty dataset

#### Target Complexity

* Time: `O(n)`
* Space: `O(k)`

---

### 4.2 Generic Group-By Function

**File:** `group-by.js`

Group any list of systems by a derived key.

#### Function Signature

```js
groupBy(systems, getKey)
```

#### Examples

```js
groupBy(systems, system => system.sy_pnum)
```

```js
groupBy(systems, system =>
	system.sy_dist < 10 ? 'near' : 'far'
)
```

#### Requirements

* Return a `Map`
* Preserve order within groups
* Support string, number and boolean keys
* Handle missing grouping values

#### Target Complexity

* Time: `O(n)`
* Space: `O(n)`

---

### 4.3 Calculate Summary Statistics

**File:** `calculate-summary-statistics.js`

Calculate summary values for a chosen numeric field.

#### Function Signature

```js
calculateSummaryStatistics(systems, field)
```

#### Output

```js
{
	count: 100,
	missing: 7,
	min: 0,
	max: 1200,
	sum: 25741,
	mean: 257.41,
	median: 199.3
}
```

#### Requirements

* Ignore missing and invalid numeric values
* Count missing values separately
* Support any numeric field
* Return sensible results for an empty dataset
* Do not mutate the input

#### Target Complexity

Without median:

* Time: `O(n)`
* Space: `O(1)`

With sorting for median:

* Time: `O(n log n)`
* Space: `O(n)`

---

### 4.4 Calculate Percentiles

**File:** `calculate-percentiles.js`

Return requested percentile values for a numeric field.

#### Function Signature

```js
calculatePercentiles(systems, 'sy_dist', [
	25,
	50,
	75,
	90,
	95
])
```

#### Output

```js
{
	25: 31.2,
	50: 79.8,
	75: 204.1,
	90: 560.7,
	95: 802.4
}
```

#### Requirements

* Ignore missing values
* Validate percentile values between `0` and `100`
* Define the interpolation method
* Sort values only once
* Handle duplicate values

#### Target Complexity

* Time: `O(n log n)`
* Space: `O(n)`

---

### 4.5 Build a Histogram

**File:** `create-histogram.js`

Place systems into numeric buckets and count each bucket.

#### Function Signature

```js
createHistogram(systems, {
	field: 'sy_dist',
	bucketSize: 100
})
```

#### Output

```js
[
	{ min: 0, max: 100, count: 42 },
	{ min: 100, max: 200, count: 31 },
	{ min: 200, max: 300, count: 18 }
]
```

#### Requirements

* Support configurable bucket size
* Ignore missing values
* Define boundary behaviour
* Include empty buckets between minimum and maximum
* Return buckets in ascending order

#### Target Complexity

* Time: `O(n + b)`
* Space: `O(b)`

Where `b` is the number of buckets.

---

### 4.6 Aggregate Groups

**File:** `aggregate-groups.js`

Group systems, then calculate statistics for each group.

#### Example

Group by planet count and calculate average distance:

```js
aggregateGroups(
	systems,
	system => system.sy_pnum,
	group => average(group, 'sy_dist')
)
```

#### Output

```js
Map {
	1 => {
		count: 403,
		averageDistance: 218.4
	},
	2 => {
		count: 197,
		averageDistance: 351.8
	}
}
```

#### Requirements

* Separate grouping logic from aggregation logic
* Support reusable aggregation callbacks
* Handle empty groups
* Ignore invalid numeric values

---

## 5. Implement Two-Pointer and Sliding-Window Algorithms

### 5.1 Find Pairs with a Target Planet Count

**File:** `two-sum-planet-count.js`

Find two systems whose combined planet counts equal a target.

#### Function Signature

```js
findPlanetCountPair(systems, target)
```

#### Input

```js
[
	{ sy_name: 'A', sy_pnum: 1 },
	{ sy_name: 'B', sy_pnum: 3 },
	{ sy_name: 'C', sy_pnum: 5 }
]
```

Target:

```js
8
```

#### Output

```js
[
	{ sy_name: 'B', sy_pnum: 3 },
	{ sy_name: 'C', sy_pnum: 5 }
]
```

#### Requirements

Implement two versions:

1. Hash-map solution
2. Sort plus two-pointer solution

#### Target Complexity

Hash-map version:

* Time: `O(n)`
* Space: `O(n)`

Two-pointer version:

* Time: `O(n log n)`
* Space: depends on sorting strategy

---

### 5.2 Find All Distance Pairs Within a Threshold

**File:** `distance-pairs-within-threshold.js`

Given systems sorted by distance from Sol, return every pair whose distance values differ by no more than a threshold.

#### Function Signature

```js
findDistancePairs(systems, threshold)
```

#### Example

Distances:

```js
[1, 3, 4, 10]
```

Threshold:

```js
3
```

Valid pairs:

```js
[
	[1, 3],
	[1, 4],
	[3, 4]
]
```

#### Requirements

* Use two pointers or a moving window
* Avoid checking every pair where possible
* Preserve references to the original systems
* Handle duplicate distances
* Ignore missing distances

#### Complexity Discussion

The search can be `O(n + p)` after sorting, where `p` is the number of returned pairs.

The number of valid pairs itself can still be `O(n²)`.

---

### 5.3 Find the Densest Distance Interval

**File:** `densest-distance-window.js`

Find the interval of fixed width containing the largest number of systems.

#### Function Signature

```js
findDensestDistanceWindow(systems, width)
```

#### Input

```js
const distances = [1, 2, 3, 8, 9, 10, 11]
const width = 3
```

#### Output

```js
{
	start: 8,
	end: 11,
	count: 4,
	systems: [...]
}
```

#### Requirements

* Sort systems by distance
* Use a sliding window
* Return the interval and matching systems
* Resolve ties consistently
* Ignore missing distances
* Do not repeatedly rescan the same window

#### Target Complexity

* Sorting: `O(n log n)`
* Window scan: `O(n)`
* Total: `O(n log n)`

---

### 5.4 Smallest Distance Range Containing `k` Systems

**File:** `smallest-range-for-k-systems.js`

Find the smallest distance interval containing at least `k` systems.

#### Function Signature

```js
findSmallestRangeForKSystems(systems, k)
```

#### Example

Distances:

```js
[1, 3, 4, 10, 12]
```

For:

```js
k = 3
```

#### Output

```js
{
	start: 1,
	end: 4,
	width: 3,
	systems: [...]
}
```

#### Requirements

* Sort by distance
* Examine windows of size `k`
* Return the narrowest range
* Resolve ties by selecting the nearer interval
* Validate `k`
* Ignore missing distances

#### Target Complexity

* Time: `O(n log n)`
* Space: `O(n)`

---

### 5.5 Rolling Average Magnitude

**File:** `rolling-average-magnitude.js`

Calculate the average visual magnitude for each fixed-size window.

#### Function Signature

```js
rollingAverage(systems, 'sy_vmag', windowSize)
```

#### Input Values

```js
[2, 4, 6, 8]
```

Window size:

```js
2
```

#### Output

```js
[3, 5, 7]
```

#### Requirements

* Use a running sum
* Do not recalculate each window from scratch
* Handle missing values explicitly
* Validate the window size
* Decide whether partial windows should be included

#### Target Complexity

* Time: `O(n)`
* Space: `O(n)` for output

#### Naive Comparison

A nested recalculation approach takes:

```text
O(n × windowSize)
```

---

### 5.6 Maximum Planet Count in Each Window

**File:** `sliding-window-maximum.js`

For each fixed-size consecutive window, return the maximum planet count.

#### Input

```js
[1, 4, 2, 8, 5]
```

Window size:

```js
3
```

#### Output

```js
[4, 8, 8]
```

#### Requirements

Implement two versions:

1. Brute-force window scan
2. Optimised deque solution

#### Target Complexity

Brute force:

* Time: `O(n × k)`

Deque solution:

* Time: `O(n)`
* Space: `O(k)`

---

## Completion Standard for Every File

Each problem file should contain:

* [ ] A clear problem description
* [ ] Function signature
* [ ] Implementation
* [ ] Example input
* [ ] Expected output
* [ ] At least five assertions
* [ ] Empty-input test
* [ ] Missing-value test
* [ ] Duplicate-value test where relevant
* [ ] Time-complexity explanation
* [ ] Space-complexity explanation
* [ ] A short note describing alternative approaches

## Suggested Completion Order

* [ ] `create-system-map.js`
* [ ] `group-by-planet-count.js`
* [ ] `group-by-distance-band.js`
* [ ] `exact-name-search.js`
* [ ] `partial-name-search.js`
* [ ] `numeric-range-search.js`
* [ ] `multi-condition-search.js`
* [ ] `binary-search-distance.js`
* [ ] `lower-bound-distance.js`
* [ ] `sort-systems-by-field.js`
* [ ] `multi-field-sort.js`
* [ ] `top-k-by-sorting.js`
* [ ] `top-k-with-heap.js`
* [ ] `quickselect-distance.js`
* [ ] `filter-systems.js`
* [ ] `group-by.js`
* [ ] `calculate-summary-statistics.js`
* [ ] `calculate-percentiles.js`
* [ ] `create-histogram.js`
* [ ] `two-sum-planet-count.js`
* [ ] `distance-pairs-within-threshold.js`
* [ ] `densest-distance-window.js`
* [ ] `smallest-range-for-k-systems.js`
* [ ] `rolling-average-magnitude.js`
* [ ] `sliding-window-maximum.js`
