var Tracker = (function (exports) {
  'use strict';

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var tracker = {};

  var kdTreeMin = {};

  /**
   * k-d Tree JavaScript - V 1.01
   *
   * https://github.com/ubilabs/kd-tree-javascript
   *
   * @author Mircea Pricop <pricop@ubilabs.net>, 2012
   * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
   * @author Ubilabs http://ubilabs.net, 2012
   * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
   */

  (function (exports) {
    !function (t, n) {
      n(exports );
    }(commonjsGlobal, function (t) {
      function n(t, n, o) {
        this.obj = t, this.left = null, this.right = null, this.parent = o, this.dimension = n;
      }

      function o(t) {
        this.content = [], this.scoreFunction = t;
      }

      o.prototype = {
        push: function (t) {
          this.content.push(t), this.bubbleUp(this.content.length - 1);
        },
        pop: function () {
          var t = this.content[0],
              n = this.content.pop();
          return this.content.length > 0 && (this.content[0] = n, this.sinkDown(0)), t;
        },
        peek: function () {
          return this.content[0];
        },
        remove: function (t) {
          for (var n = this.content.length, o = 0; o < n; o++) if (this.content[o] == t) {
            var i = this.content.pop();
            return void (o != n - 1 && (this.content[o] = i, this.scoreFunction(i) < this.scoreFunction(t) ? this.bubbleUp(o) : this.sinkDown(o)));
          }

          throw new Error("Node not found.");
        },
        size: function () {
          return this.content.length;
        },
        bubbleUp: function (t) {
          for (var n = this.content[t]; t > 0;) {
            var o = Math.floor((t + 1) / 2) - 1,
                i = this.content[o];
            if (!(this.scoreFunction(n) < this.scoreFunction(i))) break;
            this.content[o] = n, this.content[t] = i, t = o;
          }
        },
        sinkDown: function (t) {
          for (var n = this.content.length, o = this.content[t], i = this.scoreFunction(o);;) {
            var e = 2 * (t + 1),
                r = e - 1,
                l = null;

            if (r < n) {
              var u = this.content[r],
                  h = this.scoreFunction(u);
              h < i && (l = r);
            }

            if (e < n) {
              var s = this.content[e];
              this.scoreFunction(s) < (null == l ? i : h) && (l = e);
            }

            if (null == l) break;
            this.content[t] = this.content[l], this.content[l] = o, t = l;
          }
        }
      }, t.kdTree = function (t, i, e) {
        function r(t, o, i) {
          var l,
              u,
              h = o % e.length;
          return 0 === t.length ? null : 1 === t.length ? new n(t[0], h, i) : (t.sort(function (t, n) {
            return t[e[h]] - n[e[h]];
          }), l = Math.floor(t.length / 2), u = new n(t[l], h, i), u.left = r(t.slice(0, l), o + 1, u), u.right = r(t.slice(l + 1), o + 1, u), u);
        }

        var l = this;
        Array.isArray(t) ? this.root = r(t, 0, null) : function (t) {
          function n(t) {
            t.left && (t.left.parent = t, n(t.left)), t.right && (t.right.parent = t, n(t.right));
          }

          l.root = t, n(l.root);
        }(t), this.toJSON = function (t) {
          t || (t = this.root);
          var o = new n(t.obj, t.dimension, null);
          return t.left && (o.left = l.toJSON(t.left)), t.right && (o.right = l.toJSON(t.right)), o;
        }, this.insert = function (t) {
          function o(n, i) {
            if (null === n) return i;
            var r = e[n.dimension];
            return t[r] < n.obj[r] ? o(n.left, n) : o(n.right, n);
          }

          var i,
              r,
              l = o(this.root, null);
          null !== l ? (i = new n(t, (l.dimension + 1) % e.length, l), r = e[l.dimension], t[r] < l.obj[r] ? l.left = i : l.right = i) : this.root = new n(t, 0, null);
        }, this.remove = function (t) {
          function n(o) {
            if (null === o) return null;
            if (o.obj === t) return o;
            var i = e[o.dimension];
            return t[i] < o.obj[i] ? n(o.left) : n(o.right);
          }

          function o(t) {
            function n(t, o) {
              var i, r, l, u, h;
              return null === t ? null : (i = e[o], t.dimension === o ? null !== t.left ? n(t.left, o) : t : (r = t.obj[i], l = n(t.left, o), u = n(t.right, o), h = t, null !== l && l.obj[i] < r && (h = l), null !== u && u.obj[i] < h.obj[i] && (h = u), h));
            }

            var i, r, u;
            if (null === t.left && null === t.right) return null === t.parent ? void (l.root = null) : (u = e[t.parent.dimension], void (t.obj[u] < t.parent.obj[u] ? t.parent.left = null : t.parent.right = null));
            null !== t.right ? (r = (i = n(t.right, t.dimension)).obj, o(i), t.obj = r) : (r = (i = n(t.left, t.dimension)).obj, o(i), t.right = t.left, t.left = null, t.obj = r);
          }

          var i;
          null !== (i = n(l.root)) && o(i);
        }, this.nearest = function (t, n, r) {
          function u(o) {
            function r(t, o) {
              f.push([t, o]), f.size() > n && f.pop();
            }

            var l,
                h,
                s,
                c,
                a = e[o.dimension],
                g = i(t, o.obj),
                p = {};

            for (c = 0; c < e.length; c += 1) c === o.dimension ? p[e[c]] = t[e[c]] : p[e[c]] = o.obj[e[c]];

            h = i(p, o.obj), null !== o.right || null !== o.left ? (u(l = null === o.right ? o.left : null === o.left ? o.right : t[a] < o.obj[a] ? o.left : o.right), (f.size() < n || g < f.peek()[1]) && r(o, g), (f.size() < n || Math.abs(h) < f.peek()[1]) && null !== (s = l === o.left ? o.right : o.left) && u(s)) : (f.size() < n || g < f.peek()[1]) && r(o, g);
          }

          var h, s, f;
          if (f = new o(function (t) {
            return -t[1];
          }), r) for (h = 0; h < n; h += 1) f.push([null, r]);

          for (l.root && u(l.root), s = [], h = 0; h < Math.min(n, f.content.length); h += 1) f.content[h][0] && s.push([f.content[h][0].obj, f.content[h][1]]);

          return s;
        }, this.balanceFactor = function () {
          function t(n) {
            return null === n ? 0 : Math.max(t(n.left), t(n.right)) + 1;
          }

          function n(t) {
            return null === t ? 0 : n(t.left) + n(t.right) + 1;
          }

          return t(l.root) / (Math.log(n(l.root)) / Math.log(2));
        };
      }, t.BinaryHeap = o;
    });
  })(kdTreeMin);

  var munkres$1 = {exports: {}};

  /**
   * Introduction
   * ============
   *
   * The Munkres module provides an implementation of the Munkres algorithm
   * (also called the Hungarian algorithm or the Kuhn-Munkres algorithm),
   * useful for solving the Assignment Problem.
   *
   * Assignment Problem
   * ==================
   *
   * Let C be an n×n-matrix representing the costs of each of n workers
   * to perform any of n jobs. The assignment problem is to assign jobs to
   * workers in a way that minimizes the total cost. Since each worker can perform
   * only one job and each job can be assigned to only one worker the assignments
   * represent an independent set of the matrix C.
   *
   * One way to generate the optimal set is to create all permutations of
   * the indices necessary to traverse the matrix so that no row and column
   * are used more than once. For instance, given this matrix (expressed in
   * Python)
   *
   *  matrix = [[5, 9, 1],
   *        [10, 3, 2],
   *        [8, 7, 4]]
   *
   * You could use this code to generate the traversal indices::
   *
   *  def permute(a, results):
   *    if len(a) == 1:
   *      results.insert(len(results), a)
   *
   *    else:
   *      for i in range(0, len(a)):
   *        element = a[i]
   *        a_copy = [a[j] for j in range(0, len(a)) if j != i]
   *        subresults = []
   *        permute(a_copy, subresults)
   *        for subresult in subresults:
   *          result = [element] + subresult
   *          results.insert(len(results), result)
   *
   *  results = []
   *  permute(range(len(matrix)), results) # [0, 1, 2] for a 3x3 matrix
   *
   * After the call to permute(), the results matrix would look like this::
   *
   *  [[0, 1, 2],
   *   [0, 2, 1],
   *   [1, 0, 2],
   *   [1, 2, 0],
   *   [2, 0, 1],
   *   [2, 1, 0]]
   *
   * You could then use that index matrix to loop over the original cost matrix
   * and calculate the smallest cost of the combinations
   *
   *  n = len(matrix)
   *  minval = sys.maxsize
   *  for row in range(n):
   *    cost = 0
   *    for col in range(n):
   *      cost += matrix[row][col]
   *    minval = min(cost, minval)
   *
   *  print minval
   *
   * While this approach works fine for small matrices, it does not scale. It
   * executes in O(n!) time: Calculating the permutations for an n×x-matrix
   * requires n! operations. For a 12×12 matrix, that’s 479,001,600
   * traversals. Even if you could manage to perform each traversal in just one
   * millisecond, it would still take more than 133 hours to perform the entire
   * traversal. A 20×20 matrix would take 2,432,902,008,176,640,000 operations. At
   * an optimistic millisecond per operation, that’s more than 77 million years.
   *
   * The Munkres algorithm runs in O(n³) time, rather than O(n!). This
   * package provides an implementation of that algorithm.
   *
   * This version is based on
   * http://csclab.murraystate.edu/~bob.pilgrim/445/munkres.html
   *
   * This version was originally written for Python by Brian Clapper from the
   * algorithm at the above web site (The ``Algorithm::Munkres`` Perl version,
   * in CPAN, was clearly adapted from the same web site.) and ported to
   * JavaScript by Anna Henningsen (addaleax).
   *
   * Usage
   * =====
   *
   * Construct a Munkres object
   *
   *  var m = new Munkres();
   *
   * Then use it to compute the lowest cost assignment from a cost matrix. Here’s
   * a sample program
   *
   *  var matrix = [[5, 9, 1],
   *           [10, 3, 2],
   *           [8, 7, 4]];
   *  var m = new Munkres();
   *  var indices = m.compute(matrix);
   *  console.log(format_matrix(matrix), 'Lowest cost through this matrix:');
   *  var total = 0;
   *  for (var i = 0; i < indices.length; ++i) {
   *    var row = indices[l][0], col = indices[l][1];
   *    var value = matrix[row][col];
   *    total += value;
   *
   *    console.log('(' + rol + ', ' + col + ') -> ' + value);
   *  }
   *
   *  console.log('total cost:', total);
   *
   * Running that program produces::
   *
   *  Lowest cost through this matrix:
   *  [5, 9, 1]
   *  [10, 3, 2]
   *  [8, 7, 4]
   *  (0, 0) -> 5
   *  (1, 1) -> 3
   *  (2, 2) -> 4
   *  total cost: 12
   *
   * The instantiated Munkres object can be used multiple times on different
   * matrices.
   *
   * Non-square Cost Matrices
   * ========================
   *
   * The Munkres algorithm assumes that the cost matrix is square. However, it's
   * possible to use a rectangular matrix if you first pad it with 0 values to make
   * it square. This module automatically pads rectangular cost matrices to make
   * them square.
   *
   * Notes:
   *
   * - The module operates on a *copy* of the caller's matrix, so any padding will
   *   not be seen by the caller.
   * - The cost matrix must be rectangular or square. An irregular matrix will
   *   *not* work.
   *
   * Calculating Profit, Rather than Cost
   * ====================================
   *
   * The cost matrix is just that: A cost matrix. The Munkres algorithm finds
   * the combination of elements (one from each row and column) that results in
   * the smallest cost. It’s also possible to use the algorithm to maximize
   * profit. To do that, however, you have to convert your profit matrix to a
   * cost matrix. The simplest way to do that is to subtract all elements from a
   * large value.
   *
   * The ``munkres`` module provides a convenience method for creating a cost
   * matrix from a profit matrix, i.e. make_cost_matrix.
   *
   * References
   * ==========
   *
   * 1. http://www.public.iastate.edu/~ddoty/HungarianAlgorithm.html
   *
   * 2. Harold W. Kuhn. The Hungarian Method for the assignment problem.
   *    *Naval Research Logistics Quarterly*, 2:83-97, 1955.
   *
   * 3. Harold W. Kuhn. Variants of the Hungarian method for assignment
   *    problems. *Naval Research Logistics Quarterly*, 3: 253-258, 1956.
   *
   * 4. Munkres, J. Algorithms for the Assignment and Transportation Problems.
   *    *Journal of the Society of Industrial and Applied Mathematics*,
   *    5(1):32-38, March, 1957.
   *
   * 5. https://en.wikipedia.org/wiki/Hungarian_algorithm
   *
   * Copyright and License
   * =====================
   *
   * Copyright 2008-2016 Brian M. Clapper
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  (function (module) {
    /**
     * A very large numerical value which can be used like an integer
     * (i. e., adding integers of similar size does not result in overflow).
     */
    var MAX_SIZE = parseInt(Number.MAX_SAFE_INTEGER / 2) || (1 << 26) * (1 << 26);
    /**
     * A default value to pad the cost matrix with if it is not quadratic.
     */

    var DEFAULT_PAD_VALUE = 0; // ---------------------------------------------------------------------------
    // Classes
    // ---------------------------------------------------------------------------

    /**
     * Calculate the Munkres solution to the classical assignment problem.
     * See the module documentation for usage.
     * @constructor
     */

    function Munkres() {
      this.C = null;
      this.row_covered = [];
      this.col_covered = [];
      this.n = 0;
      this.Z0_r = 0;
      this.Z0_c = 0;
      this.marked = null;
      this.path = null;
    }
    /**
     * Pad a possibly non-square matrix to make it square.
     *
     * @param {Array} matrix An array of arrays containing the matrix cells
     * @param {Number} [pad_value] The value used to pad a rectangular matrix
     *
     * @return {Array} An array of arrays representing the padded matrix
     */


    Munkres.prototype.pad_matrix = function (matrix, pad_value) {
      pad_value = pad_value || DEFAULT_PAD_VALUE;
      var max_columns = 0;
      var total_rows = matrix.length;
      var i;

      for (i = 0; i < total_rows; ++i) if (matrix[i].length > max_columns) max_columns = matrix[i].length;

      total_rows = max_columns > total_rows ? max_columns : total_rows;
      var new_matrix = [];

      for (i = 0; i < total_rows; ++i) {
        var row = matrix[i] || [];
        var new_row = row.slice(); // If this row is too short, pad it

        while (total_rows > new_row.length) new_row.push(pad_value);

        new_matrix.push(new_row);
      }

      return new_matrix;
    };
    /**
     * Compute the indices for the lowest-cost pairings between rows and columns
     * in the database. Returns a list of (row, column) tuples that can be used
     * to traverse the matrix.
     *
     * **WARNING**: This code handles square and rectangular matrices.
     * It does *not* handle irregular matrices.
     *
     * @param {Array} cost_matrix The cost matrix. If this cost matrix is not square,
     *                            it will be padded with DEFAULT_PAD_VALUE. Optionally,
     *                            the pad value can be specified via options.padValue.
     *                            This method does *not* modify the caller's matrix.
     *                            It operates on a copy of the matrix.
     * @param {Object} [options] Additional options to pass in
     * @param {Number} [options.padValue] The value to use to pad a rectangular cost_matrix
     *
     * @return {Array} An array of ``(row, column)`` arrays that describe the lowest
     *                 cost path through the matrix
     */


    Munkres.prototype.compute = function (cost_matrix, options) {
      options = options || {};
      options.padValue = options.padValue || DEFAULT_PAD_VALUE;
      this.C = this.pad_matrix(cost_matrix, options.padValue);
      this.n = this.C.length;
      this.original_length = cost_matrix.length;
      this.original_width = cost_matrix[0].length;
      var nfalseArray = [];
      /* array of n false values */

      while (nfalseArray.length < this.n) nfalseArray.push(false);

      this.row_covered = nfalseArray.slice();
      this.col_covered = nfalseArray.slice();
      this.Z0_r = 0;
      this.Z0_c = 0;
      this.path = this.__make_matrix(this.n * 2, 0);
      this.marked = this.__make_matrix(this.n, 0);
      var step = 1;
      var steps = {
        1: this.__step1,
        2: this.__step2,
        3: this.__step3,
        4: this.__step4,
        5: this.__step5,
        6: this.__step6
      };

      while (true) {
        var func = steps[step];
        if (!func) // done
          break;
        step = func.apply(this);
      }

      var results = [];

      for (var i = 0; i < this.original_length; ++i) for (var j = 0; j < this.original_width; ++j) if (this.marked[i][j] == 1) results.push([i, j]);

      return results;
    };
    /**
     * Create an n×n matrix, populating it with the specific value.
     *
     * @param {Number} n Matrix dimensions
     * @param {Number} val Value to populate the matrix with
     *
     * @return {Array} An array of arrays representing the newly created matrix
     */


    Munkres.prototype.__make_matrix = function (n, val) {
      var matrix = [];

      for (var i = 0; i < n; ++i) {
        matrix[i] = [];

        for (var j = 0; j < n; ++j) matrix[i][j] = val;
      }

      return matrix;
    };
    /**
     * For each row of the matrix, find the smallest element and
     * subtract it from every element in its row. Go to Step 2.
     */


    Munkres.prototype.__step1 = function () {
      for (var i = 0; i < this.n; ++i) {
        // Find the minimum value for this row and subtract that minimum
        // from every element in the row.
        var minval = Math.min.apply(Math, this.C[i]);

        for (var j = 0; j < this.n; ++j) this.C[i][j] -= minval;
      }

      return 2;
    };
    /**
     * Find a zero (Z) in the resulting matrix. If there is no starred
     * zero in its row or column, star Z. Repeat for each element in the
     * matrix. Go to Step 3.
     */


    Munkres.prototype.__step2 = function () {
      for (var i = 0; i < this.n; ++i) {
        for (var j = 0; j < this.n; ++j) {
          if (this.C[i][j] === 0 && !this.col_covered[j] && !this.row_covered[i]) {
            this.marked[i][j] = 1;
            this.col_covered[j] = true;
            this.row_covered[i] = true;
            break;
          }
        }
      }

      this.__clear_covers();

      return 3;
    };
    /**
     * Cover each column containing a starred zero. If K columns are
     * covered, the starred zeros describe a complete set of unique
     * assignments. In this case, Go to DONE, otherwise, Go to Step 4.
     */


    Munkres.prototype.__step3 = function () {
      var count = 0;

      for (var i = 0; i < this.n; ++i) {
        for (var j = 0; j < this.n; ++j) {
          if (this.marked[i][j] == 1 && this.col_covered[j] == false) {
            this.col_covered[j] = true;
            ++count;
          }
        }
      }

      return count >= this.n ? 7 : 4;
    };
    /**
     * Find a noncovered zero and prime it. If there is no starred zero
     * in the row containing this primed zero, Go to Step 5. Otherwise,
     * cover this row and uncover the column containing the starred
     * zero. Continue in this manner until there are no uncovered zeros
     * left. Save the smallest uncovered value and Go to Step 6.
     */


    Munkres.prototype.__step4 = function () {
      var done = false;
      var row = -1,
          col = -1,
          star_col = -1;

      while (!done) {
        var z = this.__find_a_zero();

        row = z[0];
        col = z[1];
        if (row < 0) return 6;
        this.marked[row][col] = 2;
        star_col = this.__find_star_in_row(row);

        if (star_col >= 0) {
          col = star_col;
          this.row_covered[row] = true;
          this.col_covered[col] = false;
        } else {
          this.Z0_r = row;
          this.Z0_c = col;
          return 5;
        }
      }
    };
    /**
     * Construct a series of alternating primed and starred zeros as
     * follows. Let Z0 represent the uncovered primed zero found in Step 4.
     * Let Z1 denote the starred zero in the column of Z0 (if any).
     * Let Z2 denote the primed zero in the row of Z1 (there will always
     * be one). Continue until the series terminates at a primed zero
     * that has no starred zero in its column. Unstar each starred zero
     * of the series, star each primed zero of the series, erase all
     * primes and uncover every line in the matrix. Return to Step 3
     */


    Munkres.prototype.__step5 = function () {
      var count = 0;
      this.path[count][0] = this.Z0_r;
      this.path[count][1] = this.Z0_c;
      var done = false;

      while (!done) {
        var row = this.__find_star_in_col(this.path[count][1]);

        if (row >= 0) {
          count++;
          this.path[count][0] = row;
          this.path[count][1] = this.path[count - 1][1];
        } else {
          done = true;
        }

        if (!done) {
          var col = this.__find_prime_in_row(this.path[count][0]);

          count++;
          this.path[count][0] = this.path[count - 1][0];
          this.path[count][1] = col;
        }
      }

      this.__convert_path(this.path, count);

      this.__clear_covers();

      this.__erase_primes();

      return 3;
    };
    /**
     * Add the value found in Step 4 to every element of each covered
     * row, and subtract it from every element of each uncovered column.
     * Return to Step 4 without altering any stars, primes, or covered
     * lines.
     */


    Munkres.prototype.__step6 = function () {
      var minval = this.__find_smallest();

      for (var i = 0; i < this.n; ++i) {
        for (var j = 0; j < this.n; ++j) {
          if (this.row_covered[i]) this.C[i][j] += minval;
          if (!this.col_covered[j]) this.C[i][j] -= minval;
        }
      }

      return 4;
    };
    /**
     * Find the smallest uncovered value in the matrix.
     *
     * @return {Number} The smallest uncovered value, or MAX_SIZE if no value was found
     */


    Munkres.prototype.__find_smallest = function () {
      var minval = MAX_SIZE;

      for (var i = 0; i < this.n; ++i) for (var j = 0; j < this.n; ++j) if (!this.row_covered[i] && !this.col_covered[j]) if (minval > this.C[i][j]) minval = this.C[i][j];

      return minval;
    };
    /**
     * Find the first uncovered element with value 0.
     *
     * @return {Array} The indices of the found element or [-1, -1] if not found
     */


    Munkres.prototype.__find_a_zero = function () {
      for (var i = 0; i < this.n; ++i) for (var j = 0; j < this.n; ++j) if (this.C[i][j] === 0 && !this.row_covered[i] && !this.col_covered[j]) return [i, j];

      return [-1, -1];
    };
    /**
     * Find the first starred element in the specified row. Returns
     * the column index, or -1 if no starred element was found.
     *
     * @param {Number} row The index of the row to search
     * @return {Number}
     */


    Munkres.prototype.__find_star_in_row = function (row) {
      for (var j = 0; j < this.n; ++j) if (this.marked[row][j] == 1) return j;

      return -1;
    };
    /**
     * Find the first starred element in the specified column.
     *
     * @return {Number} The row index, or -1 if no starred element was found
     */


    Munkres.prototype.__find_star_in_col = function (col) {
      for (var i = 0; i < this.n; ++i) if (this.marked[i][col] == 1) return i;

      return -1;
    };
    /**
     * Find the first prime element in the specified row.
     *
     * @return {Number} The column index, or -1 if no prime element was found
     */


    Munkres.prototype.__find_prime_in_row = function (row) {
      for (var j = 0; j < this.n; ++j) if (this.marked[row][j] == 2) return j;

      return -1;
    };

    Munkres.prototype.__convert_path = function (path, count) {
      for (var i = 0; i <= count; ++i) this.marked[path[i][0]][path[i][1]] = this.marked[path[i][0]][path[i][1]] == 1 ? 0 : 1;
    };
    /** Clear all covered matrix cells */


    Munkres.prototype.__clear_covers = function () {
      for (var i = 0; i < this.n; ++i) {
        this.row_covered[i] = false;
        this.col_covered[i] = false;
      }
    };
    /** Erase all prime markings */


    Munkres.prototype.__erase_primes = function () {
      for (var i = 0; i < this.n; ++i) for (var j = 0; j < this.n; ++j) if (this.marked[i][j] == 2) this.marked[i][j] = 0;
    }; // ---------------------------------------------------------------------------
    // Functions
    // ---------------------------------------------------------------------------

    /**
     * Create a cost matrix from a profit matrix by calling
     * 'inversion_function' to invert each value. The inversion
     * function must take one numeric argument (of any type) and return
     * another numeric argument which is presumed to be the cost inverse
     * of the original profit.
     *
     * This is a static method. Call it like this:
     *
     *  cost_matrix = make_cost_matrix(matrix[, inversion_func]);
     *
     * For example:
     *
     *  cost_matrix = make_cost_matrix(matrix, function(x) { return MAXIMUM - x; });
     *
     * @param {Array} profit_matrix An array of arrays representing the matrix
     *                              to convert from a profit to a cost matrix
     * @param {Function} [inversion_function] The function to use to invert each
     *                                       entry in the profit matrix
     *
     * @return {Array} The converted matrix
     */


    function make_cost_matrix(profit_matrix, inversion_function) {
      var i, j;

      if (!inversion_function) {
        var maximum = -1.0 / 0.0;

        for (i = 0; i < profit_matrix.length; ++i) for (j = 0; j < profit_matrix[i].length; ++j) if (profit_matrix[i][j] > maximum) maximum = profit_matrix[i][j];

        inversion_function = function (x) {
          return maximum - x;
        };
      }

      var cost_matrix = [];

      for (i = 0; i < profit_matrix.length; ++i) {
        var row = profit_matrix[i];
        cost_matrix[i] = [];

        for (j = 0; j < row.length; ++j) cost_matrix[i][j] = inversion_function(profit_matrix[i][j]);
      }

      return cost_matrix;
    }
    /**
     * Convenience function: Converts the contents of a matrix of integers
     * to a printable string.
     *
     * @param {Array} matrix The matrix to print
     *
     * @return {String} The formatted matrix
     */


    function format_matrix(matrix) {
      var columnWidths = [];
      var i, j;

      for (i = 0; i < matrix.length; ++i) {
        for (j = 0; j < matrix[i].length; ++j) {
          var entryWidth = String(matrix[i][j]).length;
          if (!columnWidths[j] || entryWidth >= columnWidths[j]) columnWidths[j] = entryWidth;
        }
      }

      var formatted = '';

      for (i = 0; i < matrix.length; ++i) {
        for (j = 0; j < matrix[i].length; ++j) {
          var s = String(matrix[i][j]); // pad at front with spaces

          while (s.length < columnWidths[j]) s = ' ' + s;

          formatted += s; // separate columns

          if (j != matrix[i].length - 1) formatted += ' ';
        }

        if (i != matrix[i].length - 1) formatted += '\n';
      }

      return formatted;
    } // ---------------------------------------------------------------------------
    // Exports
    // ---------------------------------------------------------------------------


    function computeMunkres(cost_matrix, options) {
      var m = new Munkres();
      return m.compute(cost_matrix, options);
    }

    computeMunkres.version = "1.2.2";
    computeMunkres.format_matrix = format_matrix;
    computeMunkres.make_cost_matrix = make_cost_matrix;
    computeMunkres.Munkres = Munkres; // backwards compatibility

    if (module.exports) {
      module.exports = computeMunkres;
    }
  })(munkres$1);

  var lodash_isequal = {exports: {}};

  /**
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright JS Foundation and other contributors <https://js.foundation/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  (function (module, exports) {
    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;
    /** Used to stand-in for `undefined` hash values. */

    var HASH_UNDEFINED = '__lodash_hash_undefined__';
    /** Used to compose bitmasks for value comparisons. */

    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;
    /** Used as references for various `Number` constants. */

    var MAX_SAFE_INTEGER = 9007199254740991;
    /** `Object#toString` result references. */

    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        asyncTag = '[object AsyncFunction]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        nullTag = '[object Null]',
        objectTag = '[object Object]',
        promiseTag = '[object Promise]',
        proxyTag = '[object Proxy]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        symbolTag = '[object Symbol]',
        undefinedTag = '[object Undefined]',
        weakMapTag = '[object WeakMap]';
    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';
    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */

    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    /** Used to detect host constructors (Safari). */

    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    /** Used to detect unsigned integer values. */

    var reIsUint = /^(?:0|[1-9]\d*)$/;
    /** Used to identify `toStringTag` values of typed arrays. */

    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    /** Detect free variable `global` from Node.js. */

    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    /** Detect free variable `self`. */

    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
    /** Used as a reference to the global object. */

    var root = freeGlobal || freeSelf || Function('return this')();
    /** Detect free variable `exports`. */

    var freeExports = exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */

    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
    /** Detect the popular CommonJS extension `module.exports`. */

    var moduleExports = freeModule && freeModule.exports === freeExports;
    /** Detect free variable `process` from Node.js. */

    var freeProcess = moduleExports && freeGlobal.process;
    /** Used to access faster Node.js helpers. */

    var nodeUtil = function () {
      try {
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }();
    /* Node.js helper references. */


    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */

    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }

      return result;
    }
    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */


    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }

      return array;
    }
    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */


    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }

      return false;
    }
    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */


    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }

      return result;
    }
    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */


    function baseUnary(func) {
      return function (value) {
        return func(value);
      };
    }
    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */


    function cacheHas(cache, key) {
      return cache.has(key);
    }
    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */


    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }
    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */


    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);
      map.forEach(function (value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */


    function overArg(func, transform) {
      return function (arg) {
        return func(transform(arg));
      };
    }
    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */


    function setToArray(set) {
      var index = -1,
          result = Array(set.size);
      set.forEach(function (value) {
        result[++index] = value;
      });
      return result;
    }
    /** Used for built-in method references. */


    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;
    /** Used to detect overreaching core-js shims. */

    var coreJsData = root['__core-js_shared__'];
    /** Used to resolve the decompiled source of functions. */

    var funcToString = funcProto.toString;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /** Used to detect methods masquerading as native. */

    var maskSrcKey = function () {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? 'Symbol(src)_1.' + uid : '';
    }();
    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */


    var nativeObjectToString = objectProto.toString;
    /** Used to detect if a method is native. */

    var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
    /** Built-in value references. */

    var Buffer = moduleExports ? root.Buffer : undefined,
        Symbol = root.Symbol,
        Uint8Array = root.Uint8Array,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice,
        symToStringTag = Symbol ? Symbol.toStringTag : undefined;
    /* Built-in method references for those with the same name as other `lodash` methods. */

    var nativeGetSymbols = Object.getOwnPropertySymbols,
        nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
        nativeKeys = overArg(Object.keys, Object);
    /* Built-in method references that are verified to be native. */

    var DataView = getNative(root, 'DataView'),
        Map = getNative(root, 'Map'),
        Promise = getNative(root, 'Promise'),
        Set = getNative(root, 'Set'),
        WeakMap = getNative(root, 'WeakMap'),
        nativeCreate = getNative(Object, 'create');
    /** Used to detect maps, sets, and weakmaps. */

    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map),
        promiseCtorString = toSource(Promise),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);
    /** Used to convert symbols to primitives and strings. */

    var symbolProto = Symbol ? Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */

    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();

      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */


    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */


    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */


    function hashGet(key) {
      var data = this.__data__;

      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }

      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }
    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */


    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
    }
    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */


    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
      return this;
    } // Add methods to `Hash`.


    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */

    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();

      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */


    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */


    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }

      var lastIndex = data.length - 1;

      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }

      --this.size;
      return true;
    }
    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */


    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);
      return index < 0 ? undefined : data[index][1];
    }
    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */


    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */


    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }

      return this;
    } // Add methods to `ListCache`.


    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */

    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();

      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */


    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash(),
        'map': new (Map || ListCache)(),
        'string': new Hash()
      };
    }
    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */


    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */


    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */


    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */


    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    } // Add methods to `MapCache`.


    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */

    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();

      while (++index < length) {
        this.add(values[index]);
      }
    }
    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */


    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);

      return this;
    }
    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */


    function setCacheHas(value) {
      return this.__data__.has(value);
    } // Add methods to `SetCache`.


    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */

    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */


    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */


    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);
      this.size = data.size;
      return result;
    }
    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */


    function stackGet(key) {
      return this.__data__.get(key);
    }
    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */


    function stackHas(key) {
      return this.__data__.has(key);
    }
    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */


    function stackSet(key, value) {
      var data = this.__data__;

      if (data instanceof ListCache) {
        var pairs = data.__data__;

        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }

        data = this.__data__ = new MapCache(pairs);
      }

      data.set(key, value);
      this.size = data.size;
      return this;
    } // Add methods to `Stack`.


    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */

    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
            key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
            isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
            isIndex(key, length)))) {
          result.push(key);
        }
      }

      return result;
    }
    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */


    function assocIndexOf(array, key) {
      var length = array.length;

      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }

      return -1;
    }
    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */


    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */


    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }

      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */


    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */


    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }

      if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }

      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */


    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = objIsArr ? arrayTag : getTag(object),
          othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }

        objIsArr = true;
        objIsObj = false;
      }

      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }

      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }

      if (!isSameTag) {
        return false;
      }

      stack || (stack = new Stack());
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }
    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */


    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }

      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */


    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */


    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }

      var result = [];

      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }

      return result;
    }
    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */


    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      } // Assume cyclic values are equal.


      var stacked = stack.get(array);

      if (stacked && stack.get(other)) {
        return stacked == other;
      }

      var index = -1,
          result = true,
          seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
      stack.set(array, other);
      stack.set(other, array); // Ignore non-index properties.

      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }

        if (compared !== undefined) {
          if (compared) {
            continue;
          }

          result = false;
          break;
        } // Recursively compare arrays (susceptible to call stack limits).


        if (seen) {
          if (!arraySome(other, function (othValue, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }

      stack['delete'](array);
      stack['delete'](other);
      return result;
    }
    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */


    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }

          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }

          return true;

        case boolTag:
        case dateTag:
        case numberTag:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq(+object, +other);

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == other + '';

        case mapTag:
          var convert = mapToArray;

        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          } // Assume cyclic values are equal.


          var stacked = stack.get(object);

          if (stacked) {
            return stacked == other;
          }

          bitmask |= COMPARE_UNORDERED_FLAG; // Recursively compare objects (susceptible to call stack limits).

          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }

      }

      return false;
    }
    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */


    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          objProps = getAllKeys(object),
          objLength = objProps.length,
          othProps = getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }

      var index = objLength;

      while (index--) {
        var key = objProps[index];

        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      } // Assume cyclic values are equal.


      var stacked = stack.get(object);

      if (stacked && stack.get(other)) {
        return stacked == other;
      }

      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;

      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        } // Recursively compare objects (susceptible to call stack limits).


        if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }

        skipCtor || (skipCtor = key == 'constructor');
      }

      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

        if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }

      stack['delete'](object);
      stack['delete'](other);
      return result;
    }
    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */


    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */


    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
    }
    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */


    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }
    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */


    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);

      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }

      return result;
    }
    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */


    var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
      if (object == null) {
        return [];
      }

      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function (symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */

    var getTag = baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
      getTag = function (value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;

            case mapCtorString:
              return mapTag;

            case promiseCtorString:
              return promiseTag;

            case setCtorString:
              return setTag;

            case weakMapCtorString:
              return weakMapTag;
          }
        }

        return result;
      };
    }
    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */


    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
    }
    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */


    function isKeyable(value) {
      var type = typeof value;
      return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
    }
    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */


    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */


    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
      return value === proto;
    }
    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */


    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */


    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}

        try {
          return func + '';
        } catch (e) {}
      }

      return '';
    }
    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */


    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */


    var isArguments = baseIsArguments(function () {
      return arguments;
    }()) ? baseIsArguments : function (value) {
      return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
    };
    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */

    var isArray = Array.isArray;
    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */

    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */


    var isBuffer = nativeIsBuffer || stubFalse;
    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent.
     *
     * **Note:** This method supports comparing arrays, array buffers, booleans,
     * date objects, error objects, maps, numbers, `Object` objects, regexes,
     * sets, strings, symbols, and typed arrays. `Object` objects are compared
     * by their own, not inherited, enumerable properties. Functions and DOM
     * nodes are compared by strict equality, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.isEqual(object, other);
     * // => true
     *
     * object === other;
     * // => false
     */

    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }
    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */


    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      } // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.


      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */


    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */


    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }
    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */


    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }
    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */


    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */

    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */


    function stubArray() {
      return [];
    }
    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */


    function stubFalse() {
      return false;
    }

    module.exports = isEqual;
  })(lodash_isequal, lodash_isequal.exports);

  var utils = {};

  utils.isDetectionTooLarge = function (detections, largestAllowed) {
    return detections.w >= largestAllowed;
  };

  var isInsideArea = function isInsideArea(area, point) {
    var xMin = area.x - area.w / 2;
    var xMax = area.x + area.w / 2;
    var yMin = area.y - area.h / 2;
    var yMax = area.y + area.h / 2;
    return point.x >= xMin && point.x <= xMax && point.y >= yMin && point.y <= yMax;
  };

  utils.isInsideArea = isInsideArea;

  utils.isInsideSomeAreas = function (areas, point) {
    return areas.some(function (area) {
      return isInsideArea(area, point);
    });
  };

  utils.ignoreObjectsNotToDetect = function (detections, objectsToDetect) {
    return detections.filter(function (detection) {
      return objectsToDetect.indexOf(detection.name) > -1;
    });
  };

  var getRectangleEdges = function getRectangleEdges(item) {
    return {
      x0: item.x - item.w / 2,
      y0: item.y - item.h / 2,
      x1: item.x + item.w / 2,
      y1: item.y + item.h / 2
    };
  };

  utils.getRectangleEdges = getRectangleEdges;

  utils.iouAreas = function (item1, item2) {
    var rect1 = getRectangleEdges(item1);
    var rect2 = getRectangleEdges(item2); // Get overlap rectangle

    var overlap_x0 = Math.max(rect1.x0, rect2.x0);
    var overlap_y0 = Math.max(rect1.y0, rect2.y0);
    var overlap_x1 = Math.min(rect1.x1, rect2.x1);
    var overlap_y1 = Math.min(rect1.y1, rect2.y1); // if there are an overlap

    if (overlap_x1 - overlap_x0 <= 0 || overlap_y1 - overlap_y0 <= 0) {
      // no overlap
      return 0;
    }

    var area_rect1 = item1.w * item1.h;
    var area_rect2 = item2.w * item2.h;
    var area_intersection = (overlap_x1 - overlap_x0) * (overlap_y1 - overlap_y0);
    var area_union = area_rect1 + area_rect2 - area_intersection;
    return area_intersection / area_union;
  };

  utils.computeVelocityVector = function (item1, item2, nbFrame) {
    return {
      dx: (item2.x - item1.x) / nbFrame,
      dy: (item2.y - item1.y) / nbFrame
    };
  };
  /*

    computeBearingIn360

                         dY

                         ^               XX
                         |             XXX
                         |            XX
                         |           XX
                         |         XX
                         |       XXX
                         |      XX
                         |     XX
                         |    XX    bearing = this angle in degree
                         |  XX
                         |XX
  +----------------------XX----------------------->  dX
                         |
                         |
                         |
                         |
                         |
                         |
                         |
                         |
                         |
                         |
                         |
                         +

  */


  utils.computeBearingIn360 = function (dx, dy) {
    var angle = Math.atan(dx / dy) / (Math.PI / 180);

    if (angle > 0) {
      if (dy > 0) {
        return angle;
      }

      return 180 + angle;
    }

    if (dx > 0) {
      return 180 + angle;
    }

    return 360 + angle;
  };

  var ItemTracked$1 = {};

  var rngBrowser = {exports: {}};

  // browser this is a little complicated due to unknown quality of Math.random()
  // and inconsistent support for the `crypto` API.  We do the best we can via
  // feature-detection
  // getRandomValues needs to be invoked in a context where "this" is a Crypto
  // implementation. Also, find the complete implementation of crypto on IE11.

  var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);

  if (getRandomValues) {
    // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
    var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

    rngBrowser.exports = function whatwgRNG() {
      getRandomValues(rnds8);
      return rnds8;
    };
  } else {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var rnds = new Array(16);

    rngBrowser.exports = function mathRNG() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return rnds;
    };
  }

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */
  var byteToHex = [];

  for (var i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
  }

  function bytesToUuid$1(buf, offset) {
    var i = offset || 0;
    var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

    return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
  }

  var bytesToUuid_1 = bytesToUuid$1;

  var rng = rngBrowser.exports;
  var bytesToUuid = bytesToUuid_1;

  function v4(options, buf, offset) {
    var i = buf && offset || 0;

    if (typeof options == 'string') {
      buf = options === 'binary' ? new Array(16) : null;
      options = null;
    }

    options = options || {};
    var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      for (var ii = 0; ii < 16; ++ii) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || bytesToUuid(rnds);
  }

  var v4_1 = v4;

  (function (exports) {
    var uuidv4 = v4_1;
    var computeBearingIn360 = utils.computeBearingIn360;
    var computeVelocityVector = utils.computeVelocityVector; // Properties example
    // {
    //   "x": 1021,
    //   "y": 65,
    //   "w": 34,
    //   "h": 27,
    //   "confidence": 26,
    //   "name": "car"
    // }

    /** The maximum length of the item history. */

    exports.ITEM_HISTORY_MAX_LENGTH = 15; // Use a simple incremental unique id for the display

    var idDisplay = 0;

    exports.ItemTracked = function (properties, frameNb, unMatchedFramesTolerance, fastDelete) {
      var DEFAULT_UNMATCHEDFRAMES_TOLERANCE = unMatchedFramesTolerance;
      var itemTracked = {}; // ==== Private =====
      // Am I available to be matched?

      itemTracked.available = true; // Should I be deleted?

      itemTracked["delete"] = false;
      itemTracked.fastDelete = fastDelete; // How many unmatched frame should I survive?

      itemTracked.frameUnmatchedLeftBeforeDying = unMatchedFramesTolerance;
      itemTracked.isZombie = false;
      itemTracked.appearFrame = frameNb;
      itemTracked.disappearFrame = null;
      itemTracked.disappearArea = {}; // Keep track of the most counted class

      itemTracked.nameCount = {};
      itemTracked.nameCount[properties.name] = 1; // ==== Public =====

      itemTracked.x = properties.x;
      itemTracked.y = properties.y;
      itemTracked.w = properties.w;
      itemTracked.h = properties.h;
      itemTracked.name = properties.name;
      itemTracked.confidence = properties.confidence;
      itemTracked.itemHistory = [];
      itemTracked.itemHistory.push({
        x: properties.x,
        y: properties.y,
        w: properties.w,
        h: properties.h,
        confidence: properties.confidence
      });

      if (itemTracked.itemHistory.length >= exports.ITEM_HISTORY_MAX_LENGTH) {
        itemTracked.itemHistory.shift();
      }

      itemTracked.velocity = {
        dx: 0,
        dy: 0
      };
      itemTracked.nbTimeMatched = 1; // Assign an unique id to each Item tracked

      itemTracked.id = uuidv4(); // Use an simple id for the display and debugging

      itemTracked.idDisplay = idDisplay;
      idDisplay++; // Give me a new location / size

      itemTracked.update = function (properties, frameNb) {
        // if it was zombie and disappear frame was set, reset it to null
        if (this.disappearFrame) {
          this.disappearFrame = null;
          this.disappearArea = {};
        }

        this.isZombie = false;
        this.nbTimeMatched += 1;
        this.x = properties.x;
        this.y = properties.y;
        this.w = properties.w;
        this.h = properties.h;
        this.confidence = properties.confidence;
        this.itemHistory.push({
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h,
          confidence: this.confidence
        });

        if (itemTracked.itemHistory.length >= exports.ITEM_HISTORY_MAX_LENGTH) {
          itemTracked.itemHistory.shift();
        }

        this.name = properties.name;

        if (this.nameCount[properties.name]) {
          this.nameCount[properties.name]++;
        } else {
          this.nameCount[properties.name] = 1;
        } // Reset dying counter


        this.frameUnmatchedLeftBeforeDying = DEFAULT_UNMATCHEDFRAMES_TOLERANCE; // Compute new velocityVector based on last positions history

        this.velocity = this.updateVelocityVector();
      };

      itemTracked.makeAvailable = function () {
        this.available = true;
        return this;
      };

      itemTracked.makeUnavailable = function () {
        this.available = false;
        return this;
      };

      itemTracked.countDown = function (frameNb) {
        // Set frame disappear number
        if (this.disappearFrame === null) {
          this.disappearFrame = frameNb;
          this.disappearArea = {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
          };
        }

        this.frameUnmatchedLeftBeforeDying--;
        this.isZombie = true; // If it was matched less than 1 time, it should die quick

        if (this.fastDelete && this.nbTimeMatched <= 1) {
          this.frameUnmatchedLeftBeforeDying = -1;
        }
      };

      itemTracked.updateTheoricalPositionAndSize = function () {
        this.itemHistory.push({
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h,
          confidence: this.confidence
        });

        if (itemTracked.itemHistory.length >= exports.ITEM_HISTORY_MAX_LENGTH) {
          itemTracked.itemHistory.shift();
        }

        this.x += this.velocity.dx;
        this.y += this.velocity.dy;
      };

      itemTracked.predictNextPosition = function () {
        return {
          x: this.x + this.velocity.dx,
          y: this.y + this.velocity.dy,
          w: this.w,
          h: this.h
        };
      };

      itemTracked.isDead = function () {
        return this.frameUnmatchedLeftBeforeDying < 0;
      }; // Velocity vector based on the last 15 frames


      itemTracked.updateVelocityVector = function () {
        if (exports.ITEM_HISTORY_MAX_LENGTH <= 2) {
          return {
            dx: undefined,
            dy: undefined
          };
        }

        if (this.itemHistory.length <= exports.ITEM_HISTORY_MAX_LENGTH) {
          var _start = this.itemHistory[0];
          var _end = this.itemHistory[this.itemHistory.length - 1];
          return computeVelocityVector(_start, _end, this.itemHistory.length);
        }

        var start = this.itemHistory[this.itemHistory.length - exports.ITEM_HISTORY_MAX_LENGTH];
        var end = this.itemHistory[this.itemHistory.length - 1];
        return computeVelocityVector(start, end, exports.ITEM_HISTORY_MAX_LENGTH);
      };

      itemTracked.getMostlyMatchedName = function () {
        var _this = this;

        var nameMostlyMatchedOccurences = 0;
        var nameMostlyMatched = '';
        Object.keys(this.nameCount).map(function (name) {
          if (_this.nameCount[name] > nameMostlyMatchedOccurences) {
            nameMostlyMatched = name;
            nameMostlyMatchedOccurences = _this.nameCount[name];
          }
        });
        return nameMostlyMatched;
      };

      itemTracked.toJSONDebug = function () {
        var roundInt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        return {
          id: this.id,
          idDisplay: this.idDisplay,
          x: roundInt ? parseFloat(this.x) : this.x,
          y: roundInt ? parseFloat(this.y) : this.y,
          w: roundInt ? parseFloat(this.w) : this.w,
          h: roundInt ? parseFloat(this.h) : this.h,
          confidence: Math.round(this.confidence * 100) / 100,
          // Here we negate dy to be in "normal" carthesian coordinates
          bearing: parseFloat(computeBearingIn360(this.velocity.dx, -this.velocity.dy)),
          name: this.getMostlyMatchedName(),
          isZombie: this.isZombie,
          appearFrame: this.appearFrame,
          disappearFrame: this.disappearFrame
        };
      };

      itemTracked.toJSON = function () {
        var roundInt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        return {
          id: this.idDisplay,
          x: roundInt ? parseFloat(this.x) : this.x,
          y: roundInt ? parseFloat(this.y) : this.y,
          w: roundInt ? parseFloat(this.w) : this.w,
          h: roundInt ? parseFloat(this.h) : this.h,
          confidence: Math.round(this.confidence * 100) / 100,
          // Here we negate dy to be in "normal" carthesian coordinates
          bearing: parseFloat(computeBearingIn360(this.velocity.dx, -this.velocity.dy)),
          name: this.getMostlyMatchedName(),
          isZombie: this.isZombie
        };
      };

      itemTracked.toMOT = function (frameIndex) {
        return "".concat(frameIndex, ",").concat(this.idDisplay, ",").concat(this.x - this.w / 2, ",").concat(this.y - this.h / 2, ",").concat(this.w, ",").concat(this.h, ",").concat(this.confidence / 100, ",-1,-1,-1");
      };

      itemTracked.toJSONGenericInfo = function () {
        return {
          id: this.id,
          idDisplay: this.idDisplay,
          appearFrame: this.appearFrame,
          disappearFrame: this.disappearFrame,
          disappearArea: this.disappearArea,
          nbActiveFrame: this.disappearFrame - this.appearFrame,
          name: this.getMostlyMatchedName()
        };
      };

      return itemTracked;
    };

    exports.reset = function () {
      idDisplay = 0;
    };
  })(ItemTracked$1);

  var kdTree = kdTreeMin.kdTree;
  var munkres = munkres$1.exports;
  var iouAreas = utils.iouAreas;
  var ItemTracked = ItemTracked$1.ItemTracked,
      reset = ItemTracked$1.reset;

  var iouDistance = function iouDistance(item1, item2) {
    // IOU distance, between 0 and 1
    // The smaller, the less overlap
    var iou = iouAreas(item1, item2); // Invert this as the KDTREESEARCH is looking for the smaller value

    var distance = 1 - iou; // If the overlap is iou < 0.95, exclude value

    if (distance > 1 - params.iouLimit) {
      distance = params.distanceLimit + 1;
    }

    return distance;
  };

  var params = {
    // DEFAULT_UNMATCHEDFRAMES_TOLERANCE
    // This the number of frame we wait when an object isn't matched before considering it gone
    unMatchedFramesTolerance: 5,
    // DEFAULT_IOU_LIMIT, exclude things from beeing matched if their IOU is lower than this
    // 1 means total overlap whereas 0 means no overlap
    iouLimit: 0.05,
    // Remove new objects fast if they could not be matched in the next frames.
    // Setting this to false ensures the object will stick around at least
    // unMatchedFramesTolerance frames, even if they could neven be matched in
    // subsequent frames.
    fastDelete: true,
    // The function to use to determine the distance between to detected objects
    distanceFunc: iouDistance,
    // The distance limit for matching. If values need to be excluded from
    // matching set their distance to something greater than the distance limit
    distanceLimit: 10000,
    // The algorithm used to match tracks with new detections. Can be either
    // 'kdTree' or 'munkres'.
    matchingAlgorithm: 'munkres' // matchingAlgorithm: 'kdTree',

  }; // A dictionary of itemTracked currently tracked
  // key: uuid
  // value: ItemTracked object

  var mapOfItemsTracked = new Map(); // A dictionnary keeping memory of all tracked object (even after they disappear)
  // Useful to ouput the file of all items tracked

  var mapOfAllItemsTracked = new Map(); // By default, we do not keep all the history in memory

  var keepAllHistoryInMemory = false;
  var computeDistance = tracker.computeDistance = iouDistance;

  var updateTrackedItemsWithNewFrame = tracker.updateTrackedItemsWithNewFrame = function (detectionsOfThisFrame, frameNb) {
    // A kd-tree containing all the itemtracked
    // Need to rebuild on each frame, because itemTracked positions have changed
    var treeItemsTracked = new kdTree(Array.from(mapOfItemsTracked.values()), params.distanceFunc, ["x", "y", "w", "h"]); // SCENARIO 1: itemsTracked map is empty

    if (mapOfItemsTracked.size === 0) {
      // Just add every detected item as item Tracked
      detectionsOfThisFrame.forEach(function (itemDetected) {
        var newItemTracked = new ItemTracked(itemDetected, frameNb, params.unMatchedFramesTolerance, params.fastDelete); // Add it to the map

        mapOfItemsTracked.set(newItemTracked.id, newItemTracked); // Add it to the kd tree

        treeItemsTracked.insert(newItemTracked);
      });
    } // SCENARIO 2: We already have itemsTracked in the map
    else {
      var matchedList = new Array(detectionsOfThisFrame.length);
      matchedList.fill(false); // Match existing Tracked items with the items detected in the new frame
      // For each look in the new detection to find the closest match

      if (detectionsOfThisFrame.length > 0) {
        if (params.matchingAlgorithm === 'munkres') {
          var trackedItemIds = Array.from(mapOfItemsTracked.keys());
          var costMatrix = Array.from(mapOfItemsTracked.values()).map(function (itemTracked) {
            var predictedPosition = itemTracked.predictNextPosition();
            return detectionsOfThisFrame.map(function (detection) {
              return params.distanceFunc(predictedPosition, detection);
            });
          });
          mapOfItemsTracked.forEach(function (itemTracked) {
            itemTracked.makeAvailable();
          });
          munkres(costMatrix).filter(function (m) {
            return costMatrix[m[0]][m[1]] <= params.distanceLimit;
          }).forEach(function (m) {
            var itemTracked = mapOfItemsTracked.get(trackedItemIds[m[0]]);
            var updatedTrackedItemProperties = detectionsOfThisFrame[m[1]];
            matchedList[m[1]] = {
              idDisplay: itemTracked.idDisplay
            };
            itemTracked.makeUnavailable().update(updatedTrackedItemProperties, frameNb);
          });
          matchedList.forEach(function (matched, index) {
            if (!matched) {
              if (Math.min.apply(Math, _toConsumableArray(costMatrix.map(function (m) {
                return m[index];
              }))) > params.distanceLimit) {
                var newItemTracked = ItemTracked(detectionsOfThisFrame[index], frameNb, params.unMatchedFramesTolerance, params.fastDelete);
                mapOfItemsTracked.set(newItemTracked.id, newItemTracked);
                newItemTracked.makeUnavailable();
                costMatrix.push(detectionsOfThisFrame.map(function (detection) {
                  return params.distanceFunc(newItemTracked, detection);
                }));
              }
            }
          });
        } else if (params.matchingAlgorithm === 'kdTree') {
          // Contruct a kd tree for the detections of this frame
          var treeDetectionsOfThisFrame = new kdTree(detectionsOfThisFrame, params.distanceFunc, ["x", "y", "w", "h"]);
          mapOfItemsTracked.forEach(function (itemTracked) {
            // First predict the new position of the itemTracked
            var predictedPosition = itemTracked.predictNextPosition(); // Make available for matching

            itemTracked.makeAvailable(); // Search for a detection that matches

            var treeSearchResult = treeDetectionsOfThisFrame.nearest(predictedPosition, 1, params.distanceLimit)[0]; // Only for debug assessments of predictions

            treeDetectionsOfThisFrame.nearest(itemTracked, 1, params.distanceLimit)[0]; // Only if we enable the extra refinement

            treeDetectionsOfThisFrame.nearest(predictedPosition, 2, params.distanceLimit); // If we have found something

            if (treeSearchResult) {

              var indexClosestNewDetectedItem = detectionsOfThisFrame.indexOf(treeSearchResult[0]); // If this detections was not already matched to a tracked item
              // (otherwise it would be matched to two tracked items...)

              if (!matchedList[indexClosestNewDetectedItem]) {
                matchedList[indexClosestNewDetectedItem] = {
                  idDisplay: itemTracked.idDisplay
                }; // Update properties of tracked object

                var updatedTrackedItemProperties = detectionsOfThisFrame[indexClosestNewDetectedItem];
                mapOfItemsTracked.get(itemTracked.id).makeUnavailable().update(updatedTrackedItemProperties, frameNb);
              }
            }
          });
        } else {
          throw "Unknown matching algorithm \"".concat(params.matchingAlgorithm, "\"");
        }
      } else {


        mapOfItemsTracked.forEach(function (itemTracked) {
          itemTracked.makeAvailable();
        });
      }

      if (params.matchingAlgorithm === 'kdTree') {
        // Add any unmatched items as new trackedItem only if those new items are not too similar
        // to existing trackedItems this avoids adding some double match of YOLO and bring down drasticly reassignments
        if (mapOfItemsTracked.size > 0) {
          // Safety check to see if we still have object tracked (could have been deleted previously)
          // Rebuild tracked item tree to take in account the new positions
          treeItemsTracked = new kdTree(Array.from(mapOfItemsTracked.values()), params.distanceFunc, ["x", "y", "w", "h"]); // console.log(`Nb new items Unmatched : ${matchedList.filter((isMatched) => isMatched === false).length}`)

          matchedList.forEach(function (matched, index) {
            // Iterate through unmatched new detections
            if (!matched) {
              // Do not add as new tracked item if it is to similar to an existing one
              var treeSearchResult = treeItemsTracked.nearest(detectionsOfThisFrame[index], 1, params.distanceLimit)[0];

              if (!treeSearchResult) {
                var newItemTracked = ItemTracked(detectionsOfThisFrame[index], frameNb, params.unMatchedFramesTolerance, params.fastDelete); // Add it to the map

                mapOfItemsTracked.set(newItemTracked.id, newItemTracked); // Add it to the kd tree

                treeItemsTracked.insert(newItemTracked); // Make unvailable

                newItemTracked.makeUnavailable();
              }
            }
          });
        }
      } // Start killing the itemTracked (and predicting next position)
      // that are tracked but haven't been matched this frame


      mapOfItemsTracked.forEach(function (itemTracked) {
        if (itemTracked.available) {
          itemTracked.countDown(frameNb);
          itemTracked.updateTheoricalPositionAndSize();

          if (itemTracked.isDead()) {
            mapOfItemsTracked["delete"](itemTracked.id);
            treeItemsTracked.remove(itemTracked);

            if (keepAllHistoryInMemory) {
              mapOfAllItemsTracked.set(itemTracked.id, itemTracked);
            }
          }
        }
      });
    }
  };

  var reset_1 = tracker.reset = function () {
    mapOfItemsTracked = new Map();
    mapOfAllItemsTracked = new Map();
    reset();
  };

  var setParams = tracker.setParams = function (newParams) {
    Object.keys(newParams).forEach(function (key) {
      params[key] = newParams[key];
    });
  };

  var enableKeepInMemory = tracker.enableKeepInMemory = function () {
    keepAllHistoryInMemory = true;
  };

  var disableKeepInMemory = tracker.disableKeepInMemory = function () {
    keepAllHistoryInMemory = false;
  };

  var getJSONOfTrackedItems = tracker.getJSONOfTrackedItems = function () {
    var roundInt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    return Array.from(mapOfItemsTracked.values()).map(function (itemTracked) {
      return itemTracked.toJSON(roundInt);
    });
  };

  var getJSONDebugOfTrackedItems = tracker.getJSONDebugOfTrackedItems = function () {
    var roundInt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    return Array.from(mapOfItemsTracked.values()).map(function (itemTracked) {
      return itemTracked.toJSONDebug(roundInt);
    });
  };

  var getTrackedItemsInMOTFormat = tracker.getTrackedItemsInMOTFormat = function (frameNb) {
    return Array.from(mapOfItemsTracked.values()).map(function (itemTracked) {
      return itemTracked.toMOT(frameNb);
    });
  }; // Work only if keepInMemory is enabled


  var getAllTrackedItems = tracker.getAllTrackedItems = function () {
    return mapOfAllItemsTracked;
  }; // Work only if keepInMemory is enabled


  var getJSONOfAllTrackedItems = tracker.getJSONOfAllTrackedItems = function () {
    return Array.from(mapOfAllItemsTracked.values()).map(function (itemTracked) {
      return itemTracked.toJSONGenericInfo();
    });
  };

  exports.computeDistance = computeDistance;
  exports["default"] = tracker;
  exports.disableKeepInMemory = disableKeepInMemory;
  exports.enableKeepInMemory = enableKeepInMemory;
  exports.getAllTrackedItems = getAllTrackedItems;
  exports.getJSONDebugOfTrackedItems = getJSONDebugOfTrackedItems;
  exports.getJSONOfAllTrackedItems = getJSONOfAllTrackedItems;
  exports.getJSONOfTrackedItems = getJSONOfTrackedItems;
  exports.getTrackedItemsInMOTFormat = getTrackedItemsInMOTFormat;
  exports.reset = reset_1;
  exports.setParams = setParams;
  exports.updateTrackedItemsWithNewFrame = updateTrackedItemsWithNewFrame;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
