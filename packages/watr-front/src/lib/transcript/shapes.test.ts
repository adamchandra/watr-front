import 'chai/register-should'

import _ from 'lodash'
import { PointRepr, Point, RectRepr, Rect, CircleRepr, Circle, LineRepr, Line, TriangleRepr, Triangle, TrapezoidRepr, Trapezoid, Shape } from './shapes'
import { isIsomorphic } from '~/lib/codec-utils'

describe('Shape IO', () => {
  const verbose = false

  it('should Point i/o', () => {
    const examples: any[] = [
      [3, 4],
      [30, 40],
      [33, 44],
      [303, 404]
    ]

    _.each(examples, (example) => {
      expect(isIsomorphic(PointRepr, example, verbose)).toBe(true)
      expect(isIsomorphic(Point, example, verbose)).toBe(true)
    })
  })

  it('should Circle i/o', () => {
    const examples: any[] = [
      [[3, 4], 1],
      [[30, 40], 10],
      [[33, 44], 11],
      [[303, 404], 101]
    ]

    _.each(examples, (example) => {
      expect(isIsomorphic(CircleRepr, example, verbose)).toBe(true)
      expect(isIsomorphic(Circle, example, verbose)).toBe(true)
    })
  })

  it('should Line i/o', () => {
    const examples: any[] = [
      [[3, 4], [3, 4]],
      [[30, 40], [30, 40]],
      [[33, 44], [33, 44]],
      [[303, 404], [303, 404]]
    ]

    _.each(examples, (example) => {
      expect(isIsomorphic(LineRepr, example, verbose)).toBe(true)
      expect(isIsomorphic(Line, example, verbose)).toBe(true)
    })
  })

  it('should Rect i/o', () => {
    const examples: any[] = [
      [1, 2, 3, 4],
      [10, 20, 30, 40],
      [11, 22, 33, 44],
      [101, 202, 303, 404]
    ]
    _.each(examples, (example) => {
      expect(isIsomorphic(RectRepr, example, verbose)).toBe(true)
      expect(isIsomorphic(Rect, example, verbose)).toBe(true)
    })
  })

  it('should Triangle i/o', () => {
    const examples: any[] = [
      [[0, 0], [0, 0], [0, 0]],
      [[1, 2], [3, 4], [5, 6]],
      [[101, 202], [303, 404], [505, 606]]

    ]
    _.each(examples, (example) => {
      expect(isIsomorphic(TriangleRepr, example, verbose)).toBe(true)
      expect(isIsomorphic(Triangle, example, verbose)).toBe(true)
    })
  })

  it('should Trapezoid i/o', () => {
    const examples: any[] = [
      [[0, 0], 1, [0, 0], 2],
      [[1, 2], 0, [3, 4], 3],
      [[101, 202], 100, [303, 404], 505]
    ]
    _.each(examples, (example) => {
      expect(isIsomorphic(TrapezoidRepr, example, verbose)).toBe(true)
      expect(isIsomorphic(Trapezoid, example, verbose)).toBe(true)
    })
  })

  it('should Shape i/o', () => {
    const examples: any[] = [
      [30, 40],
      [[30, 40], [30, 40]],
      [[30, 40], 10],
      [[1, 2], 10, [3, 4], 3],
      [10, 20, 30, 40],
      [[1, 2], [3, 4], [5, 6]]
    ]
    _.each(examples, (example) => {
      expect(isIsomorphic(Shape, example, verbose)).toBe(true)
    })
  })
})
