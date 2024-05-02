# 😊Emote😞
"😊Emote😞" is a social network site with a twist: you can only post/comment using exclusively emojis. So instead of saying 
'I love this photo' you could express it as '📸❤️😍.' Additionally, if you're stuck on which emojis to choose, you can 
use the built-in AI translator to convert your plaintext to emojis.

## Todo
- [x] Rough wireframes sketched on pen and paper
- [x] ER diagram 
- [x] Plan endpoints
- [x] Build the backend with express.js, implementing endpoints one by one using the plan
- [ ] Make api docs using swagger

## Wireframes
Coming soon

## Api docs
Coming soon

## Technical decisions
### SQL
I used the query builder knex with most SQL just written raw with the occasional use of knex for dynamic queries when 
building it out gets ugly. I prefer writing raw sql since you don't have to learn the quirks and syntax of different ORMs
and can ensure you exactly know the sql being executed. This leads to a simpler mental model, and allows you to write 
efficient queries making full use of all of your SQL dialect's features. However, I can see how an ORMs ability to
fetch related data and neatly format it in the json could reduce a lot of boilerplate as I had to make use of PostgreSQL's 
JSON functions which can lead to some fairly complex queries. But, most of the time when you need to do anything
slightly complicated the ORM either generates inefficient SQL or it simply cant meet all your requirements and so you
have to do further processing on the data at the application level. Overall, I'm far more happy having to write a bit
more boilerplate if it gives me complete control over the SQL.

### Auth
Ah the allure of JWTs, stateless auth powered by cryptographic magic. Less state and one less dependancy in the form of
redis for managing sessions. It sounded too good to be true and it sort of is once you realise the token is valid until it
expires and hence there's no way to instantly revoke a token. This is useful for example if you want to ban a user and prevent
them from using your site until the token expires, or if a malicious actor gets a hold of it and uses it to log in; a 
password reset could be used to revoke the token and lock them out. There are remedies to this such as storing a blacklist 
of tokens or using refresh tokens, but these all reintroduce state and hence defeat the purpose of using JWTs in the first place.

Since I had already implemented JWTs before realising this and the fact that this is a silly hobby project, I'm happy to 
stick with it for now but in the future I'll be going with a stateful solution.

Also, on the topic of storing tokens in local storage vs an HttpOnly cookie. Yes with local storage it's vulnerable to
XSS but this doesn't really matter since if you're comprised by XSS much worse can happen anyway, and using cookies 
leads to its own problems with CSRF.

### Validation
The request body, querystring and route params are all validated against Joi schemas using reusable middlewares which
carry out the validation and pass control to the error handler if the data is in an invalid format.

### Performance
I wrote a script to seed the database with realistic data for over 1M rows which allowed me to EXPLAIN ANALYSE my more
complex queries to make them as efficient as possible.

### Error handling
Objects with a status code and message are passed to my error handler for a variety of different http errors. Also thrown
errors are automatically passed to the error handler with the express-async-errors package, so I don't have to try/catch every
async await statement.

## ER diagram
![ER diagram](./backend/docs/er-diagram.png)

## Original endpoint plan
#### Auth -
- POST /auth/login
- POST /auth/register
- POST /auth/logout

#### Users -
- GET /users?q=&page=&limit= (include friendship status)
- GET, PATCH /users/:id

#### Posts -
- GET /friendships/posts?page=&limit= (include reactions, a few comments)
- GET /users/:id/posts?page=&limit=
- POST /posts
- PATCH, DELETE /posts/:id

#### Reactions -
- POST, DELETE /posts/:id/reactions

#### Comments -
- GET /posts/:id/comments?page=&limit=
- POST /posts/:id/comments
- PATCH, DELETE /comments/:id

#### Friendships -
- GET /users/:id/friendships?q=&page=&limit=
- DELETE /friendships/:id
- POST /friendships/:userId (create friendship between logged in user and user of given id, delete friend request)

#### Friend requests -
- GET /friend-requests?q=&type=&page=&limit= (get friend requests for logged-in user)
- POST, DELETE /friend-requests/:userId

#### Others -
- GET /translate-text-to-emojis?text=
