**Online Learning Progress Tracker Application Overview:The online learning progress tracker application is designed to help users efficiently manage their modules,lessons, and quizz scores by providing a user-friendly interface for creating, viewing, updating, and deleting modules and quizzes. And a feature that generates a certificate for you to download so you can keep record of the modules you've done even if you deletet the module later. It also includes essential features such as secure user authentication, allowing individuals to sign up and log in to their accounts, as well as profile management to update personal information. With built-in validation such as input field validation and email validation, the application ensures a seamless user experience while enhancing productivity and organization in both personal and professional settings. **

**The system supports **two types of users****:
- **Students** — Create and manage modules, assignments, and semesters.  
- **Educators** — Manage student accounts and monitor their learning progress.


**This apps **contain** the following features:**

* Signup (as student or educator)
* Login
* Logout
* Update profile
* Add module
* View module
* Update module
* Delete module
* Add assignment
* View assignment
* Update assignment
* Delete assignment
* Download certitifcate
* Delete certificate
* Add semester
* View semester
* Update semester
* Delete semester
* Role-based Access (Educator can view all student accounts)

---------

**Prerequisite:** Please install the following software and create account in following web tools** **

* **Nodejs [**[https://nodejs.org/en](https://nodejs.org/en)]** **
* **Git [**[https://git-scm.com/](https://git-scm.com/)]** **
* **VS code editor** [[https://code.visualstudio.com/](https://code.visualstudio.com/)]** **
* **MongoDB Account** [[https://account.mongodb.com/account/login](https://account.mongodb.com/account/login)]**
* **GitHub Account** [[https://github.com/signup?source=login](https://github.com/signup?source=login)]** **
* **Public IP** [[http://3.27.235.24](http://3.27.235.24)]** **

---

**Tech Stack**


* Frontend: React.js + JavaScript
* Backend: Node.js + Express 
* Database: MongoDB
* Other Tools: Axios, Context API (for auth)
* Testing: Mocha, Chai, Postman
* Deployment: AWS

---

**Installation instructions**
* Clone the repository into your local drive and then install the dependencies.
* Install the following command in root folder (i.e., A2_IFN636_Learning_Progress_Tracker) for backend and frontend dependencies: npm run install-all
* Change axiosConfig.js baseURL comment out the localhost ip and comment the AWS ip address ( comment by typing // infront)
* Once the installation is complete: npm start


---


**Usage Example**

* Students can mark modules as completed by finishing all lessons.
* Once all lessons are completed, a certificate is generated automatically.
* Students can manage modules in semester
* Assignment scores are logged and stored for review

