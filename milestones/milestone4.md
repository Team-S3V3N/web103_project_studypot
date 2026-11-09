# Milestone 4

This document should be completed and submitted during **Unit 8** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Update the completion percentage of each GitHub Milestone. The milestone for this unit (Milestone 4 - Unit 8) should be 100% completed when you submit for full points.
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of the feature's name.
  - [x] Under each feature you have completed, include a GIF showing feature functionality.
- [x] In this document, complete all five questions in the **Reflection** section below.

## Reflection

### 1. What went well during this unit?

This unit we finished Edit and Delete Sessions, which was our "at risk" feature from last unit. We also fixed a security problem: before, any student could edit or delete someone else's session. Now only the student who created a session can edit or delete it, and the server checks this too. We added a way to switch between student accounts from the profile menu, which makes it easy to show the app to others. We also moved hosting and editing a session onto their own pages with a calendar and a time picker, and cleaned up the top bar and footer. Our iMessage group chat kept working well for splitting up tasks and reviewing each other's changes.

### 2. What were some challenges your group faced in this unit?

Our app does not have real logins yet, so we had to find a simple way for the server to know which student is making a request before we could lock editing to the host. The design took a few tries. The pop-up form felt cramped, and we went through a few versions of the time picker before we liked it. We also got mixed up with branches. Some work ended up on a different branch than we planned, and we had to sort out which branch had which changes before opening a pull request. Another challenge is that each of us uses our own database, so our sample data does not always match when we test.

### Did you finish all of your tasks in your sprint plan for this week? If you did not finish all of the planned tasks, how would you prioritize the remaining tasks on your list?

Yes, we finished the main tasks we planned: edit and delete sessions, making sure only the host can change a session, and the UI improvements.

### Which features and user stories would you consider “at risk”? How will you change your plan if those items remain “at risk”?

Deployment is the item we consider most "at risk". Right now each of us has a separate database, so we still need to set up one shared database for the deployed app and for Demo Day. Real student accounts are also at risk, because we are still using demo accounts instead of real sign-in. If these stay at risk, we will deploy with one shared database first and keep the demo account switcher for Demo Day, and only add real sign-in if we have time.

### 5. What additional support will you need in upcoming units as you continue to work on your final project?

We would like some help with deploying the frontend, backend, and database together on Render, especially setting up one shared PostgreSQL database for the whole team. Some tips on adding simple sign-in for students would also be helpful if we have time to add it.
