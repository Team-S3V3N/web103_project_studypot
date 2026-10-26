# Milestone 2

This document should be completed and submitted during **Unit 6** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] In `planning/wireframes.md`: add wireframes for at least three pages in your web app.
  - [x] Include a list of pages in your app
- [x] In `planning/entity_relationship_diagram.md`: add the entity relationship diagram you developed for your database.
  - [x] Your entity relationship diagram should include the tables in your database.
- [ ] Prepare your three-minute pitch presentation, to be presented during Unit 7 (the next unit).
  - [ ] You do **not** need to submit any materials in advance of your pitch.
- [x] In this document, complete all three questions in the **Reflection** section below

## Reflection

### 1. What went well during this unit?

Our user stories from Milestone 1 mapped directly onto the pages we wireframed (dashboard, create session modal, session details) and onto the three tables in our ERD, so the wireframes and database design stayed consistent with each other.

### 2. What were some challenges your group faced in this unit?

The hardest part was designing the database. We had to decide how to model students joining sessions, and settled on a `session_participants` join table to handle the many-to-many relationship between students and study sessions. We also had to decide which features belong on which page, such as using a modal for creating sessions instead of a separate page.

### 3. What additional support will you need in upcoming units as you continue to work on your final project?

We would like feedback on our database schema before we build it, especially the join table and foreign keys. We will also need support connecting the React frontend to the Express API and PostgreSQL database, and deploying the full app to Render.
