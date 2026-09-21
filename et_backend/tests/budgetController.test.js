import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCategoryHierarchyMap,
  getBudgetStatus
} from '../budgets/budgetController.js';

describe('Budget Progress & Hierarchy Unit Tests', () => {

  describe('buildCategoryHierarchyMap', () => {
    it('should map flat categories with no parents to arrays of just themselves', () => {
      const categories = [
        { id: 'cat-1', category_name: 'Housing', parent_id: null },
        { id: 'cat-2', category_name: 'Food', parent_id: null }
      ];

      const map = buildCategoryHierarchyMap(categories);
      assert.deepEqual(map.get('cat-1'), ['cat-1']);
      assert.deepEqual(map.get('cat-2'), ['cat-2']);
    });

    it('should recursively map parent categories to include all children and grandchildren', () => {
      const categories = [
        { id: 'cat-parent', category_name: 'Food & Dining', parent_id: null },
        { id: 'cat-child-1', category_name: 'Restaurants', parent_id: 'cat-parent' },
        { id: 'cat-child-2', category_name: 'Fast Food', parent_id: 'cat-parent' },
        { id: 'cat-grandchild', category_name: 'Coffee & Snacks', parent_id: 'cat-child-1' }
      ];

      const map = buildCategoryHierarchyMap(categories);
      const parentDescendants = map.get('cat-parent');

      assert.ok(parentDescendants.includes('cat-parent'));
      assert.ok(parentDescendants.includes('cat-child-1'));
      assert.ok(parentDescendants.includes('cat-child-2'));
      assert.ok(parentDescendants.includes('cat-grandchild'));
      assert.equal(parentDescendants.length, 4);

      // Child 1 includes itself and grandchild
      const child1Descendants = map.get('cat-child-1');
      assert.deepEqual(child1Descendants, ['cat-child-1', 'cat-grandchild']);
    });
  });

  describe('getBudgetStatus classification', () => {
    it('should return "normal" for usage under 80%', () => {
      assert.equal(getBudgetStatus(0), 'normal');
      assert.equal(getBudgetStatus(50), 'normal');
      assert.equal(getBudgetStatus(79.9), 'normal');
    });

    it('should return "warning" for usage between 80% and 100%', () => {
      assert.equal(getBudgetStatus(80), 'warning');
      assert.equal(getBudgetStatus(90.5), 'warning');
      assert.equal(getBudgetStatus(100), 'warning');
    });

    it('should return "exceeded" for usage over 100%', () => {
      assert.equal(getBudgetStatus(100.1), 'exceeded');
      assert.equal(getBudgetStatus(125), 'exceeded');
      assert.equal(getBudgetStatus(300), 'exceeded');
    });
  });

  describe('Budget edge-case calculations', () => {
    it('should handle zero transactions / zero spend correctly', () => {
      const allocated = 1000;
      const spent = 0;
      const percentage = allocated > 0 ? Math.round((spent / allocated) * 1000) / 10 : 0;
      const remaining = Math.max(0, allocated - spent);
      const overAmount = spent > allocated ? spent - allocated : 0;
      const status = getBudgetStatus(percentage);

      assert.equal(percentage, 0);
      assert.equal(remaining, 1000);
      assert.equal(overAmount, 0);
      assert.equal(status, 'normal');
    });

    it('should calculate overspend and over_amount accurately', () => {
      const allocated = 500;
      const spent = 650;
      const percentage = allocated > 0 ? Math.round((spent / allocated) * 1000) / 10 : 0;
      const remaining = Math.max(0, allocated - spent);
      const overAmount = spent > allocated ? spent - allocated : 0;
      const status = getBudgetStatus(percentage);

      assert.equal(percentage, 130);
      assert.equal(remaining, 0);
      assert.equal(overAmount, 150);
      assert.equal(status, 'exceeded');
    });

    it('should calculate mid-month near-threshold (80-100%) correctly', () => {
      const allocated = 1000;
      const spent = 850;
      const percentage = allocated > 0 ? Math.round((spent / allocated) * 1000) / 10 : 0;
      const remaining = Math.max(0, allocated - spent);
      const overAmount = spent > allocated ? spent - allocated : 0;
      const status = getBudgetStatus(percentage);

      assert.equal(percentage, 85);
      assert.equal(remaining, 150);
      assert.equal(overAmount, 0);
      assert.equal(status, 'warning');
    });
  });

});
