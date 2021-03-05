import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CoursesService } from "./courses.service";
import { Course } from "../model/course";
import { HttpErrorResponse } from "@angular/common/http";
import { COURSES, findLessonsForCourse, LESSONS } from "../../../../server/db-data";

describe('CoursesService', () => {

  let coursesService: CoursesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CoursesService
      ]
    });

    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  it('should retrieve all courses', () => {

    coursesService.findAllCourses()
      .subscribe(courses => {
        const course = courses.find(course => course.id == 12);
        expect(courses).toBeTruthy('No courses have been returned');
        expect(courses.length).toBe(12, 'Incorrect number of courses');
        expect(course.titles.description).toBe('Angular Testing Course');
      });

    const req = httpTestingController.expectOne('/api/courses');
    req.flush({payload: Object.values(COURSES)});

    expect(req.request.method).toEqual('GET');

  });

  it('should find a course by id', () => {

    coursesService.findCourseById(12)
      .subscribe(course => {
        expect(course).toBeTruthy('No course have been returned');
        expect(course.id).toBe(12);
      });

    const req = httpTestingController.expectOne('/api/courses/12');
    req.flush(COURSES[12]);

    expect(req.request.method).toBe('GET');

  });

  it('should save the course data', () => {

    const changes: Partial<Course> = {
      titles: {
        description: 'Changed Course Description'
      }
    };

    coursesService.saveCourse(12, changes)
      .subscribe(course => {
        expect(course).toBeTruthy('No course have been returned');
        expect(course.id).toBe(12);
        expect(course.titles.description).toBe('Changed Course Description');
      });

    const req = httpTestingController.expectOne('/api/courses/12');
    req.flush({
      ...COURSES[12],
      ...changes
    });

    expect(req.request.method).toBe('PUT');
    expect(req.request.body.titles.description).toEqual(changes.titles.description);

  });

  it('should give an error if save course fails', () => {

    const changes: Partial<Course> = {
      titles: {
        description: 'Changed Course Description'
      }
    };

    coursesService.saveCourse(12, changes)
      .subscribe(
        () =>  fail(),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
        });

    const req = httpTestingController.expectOne('/api/courses/12');
    req.flush('Save course failed',{status: 500, statusText: 'Internal Server Error'})

    expect(req.request.method).toBe('PUT');

  });

  it('should find a list of lessons', () => {

    coursesService.findLessons(12)
      .subscribe(lessons => {
        expect(lessons).toBeTruthy();
        expect(lessons.length).toBe(3);
      });

    const req = httpTestingController.expectOne(req => req.url == '/api/lessons');
    req.flush({
      payload: findLessonsForCourse(12).slice(0, 3)
    });

    expect(req.request.method).toEqual('GET');

    expect(req.request.params.get('courseId')).toEqual('12');
    expect(req.request.params.get('filter')).toEqual('');
    expect(req.request.params.get('sortOrder')).toEqual('asc');
    expect(req.request.params.get('pageNumber')).toEqual('0');
    expect(req.request.params.get('pageSize')).toEqual('3');

  });

  afterEach(() => {
    httpTestingController.verify();
  });

});
