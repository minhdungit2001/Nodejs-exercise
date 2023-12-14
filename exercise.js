const fs = require("fs");
const BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Write file json
 * @param {String} path of file result
 * @param {JSON} data result data want to write
 */
const writeResultToFileJson = function (path, data) {
  const jsonData = JSON.stringify(data);

  fs.writeFile(path, jsonData, (err) => {
    if (err) {
      console.error(`Write file ${path} error:`, err);
    } else {
      console.log(`Write file ${path} success.`);
    }
  });
};

/**
 * Get data from API
 * @param {String} path endpoint path
 * @returns json data
 */
async function getDataAsync(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`);

    return res.json();
  } catch (error) {
    console.log(`Fetch API ${path} error`, error);
  }
}

/**
 * Get post with comments
 * @param {any} postId post id
 * @returns post with comments
 */
async function getPostWithCommentsAsync(postId) {
  try {
    const [post, comments] = await Promise.all([
      getDataAsync(`/posts/${postId}`),
      getDataAsync(`/posts/${postId}/comments`),
    ]);

    return { ...post, comments };
  } catch (error) {
    console.log(`Fetch API with ${postId} error`, error);
  }
}

/**
 * Merge user with posts and comments
 * @param {Array} user
 * @param {Array} posts
 * @param {Array} comments
 * @returns {Array} list user with comment and posts
 */
const mergeUserWithCommentsAndPosts = ({ user, posts, comments }) => {
  try {
    const { id, name, username, email } = user;

    // Filter and format posts
    const filterPosts = filterPostDtosByUserId(posts, id);

    // Filter and format comments
    const filterComments = filterPosts.flatMap((post) =>
      filterCommentDtosByPostId(comments, post.id)
    );

    return {
      id,
      name,
      username,
      email,
      posts: filterPosts,
      comments: filterComments,
    };
  } catch (error) {
    console.log("mergeUserWithCommentsAndPosts fail error:", error);
  }
};

/**
 * Filter with userId and map DTO for post
 * @param {Array} posts
 * @param {String} userId
 * @returns
 */
function filterPostDtosByUserId(posts, userId) {
  try {
    return posts
      .filter((post) => post.userId === userId)
      .map(({ id, title, body }) => ({ id, title, body }));
  } catch (error) {
    console.log("filterPostDtosByUserId fail error:", error);
  }
}
/**
 * Filter with postId and map DTO for comments
 * @param {Array} comments
 * @param {String} postId
 * @returns
 */
function filterCommentDtosByPostId(comments, postId) {
  try {
    return comments
      .filter((comment) => comment.postId === postId)
      .map(({ id, postId, name, body }) => ({ id, postId, name, body }));
  } catch (error) {
    console.log("filterCommentDtosByPostId fail error:", error);
  }
}

/**
 * Filter user with minleng of comments function
 * @param {Array} users user have property comments
 * @param {Number} minLength
 * @returns
 */
function filterUsersByMinComments(users, minLength) {
  try {
    return users.filter((user) => user.comments.length > minLength);
  } catch (error) {
    console.log("filterUsersByMinComments fail error:", error);
  }
}

/**
 * Sort the list of users by the property value descending
 * @param {Array} users
 * @param {String} property of user
 * @returns
 */
function sortUserDescByField(users, property) {
  try {
    return users.sort((pre, cur) => cur[property] - pre[property]);
  } catch (error) {
    console.log("sortUserDescByField fail error:", error);
  }
}

/**
 * Get the user with the most comments/posts
 * @param {Array} users
 * @param {String} property
 * @returns
 */
function findUserMaxCountOfField(users, property) {
  try {
    return users.reduce((pre, cur) =>
      cur[property] > pre[property] ? cur : pre
    );
  } catch (error) {
    console.log("findUserMaxCountOfField fail error:", error);
  }
}

async function main() {
  try {
    // Exercise 1, 2
    const [users, posts, comments] = await Promise.all([
      getDataAsync("/users"),
      getDataAsync("/posts "),
      getDataAsync("/comments"),
    ]);

    // Exercise 3
    const usersWithCommentsAndPosts = users.map((user) =>
      mergeUserWithCommentsAndPosts({ user, posts, comments })
    );

    // Exercise 4
    const usersWithMoreThanThreeComments = filterUsersByMinComments(
      usersWithCommentsAndPosts,
      3
    );

    // Exercise 5
    const usersWithCountCommentsAndPosts = usersWithCommentsAndPosts.map(
      ({ id, name, username, email, posts, comments }) => ({
        id,
        name,
        username,
        email,
        postsCount: posts.length,
        commentsCount: comments.length,
      })
    );

    // Exercise 6
    // If there is more than one user with postsCount/commentsCount value of max then the most is the first user
    const userTheMostPost = findUserMaxCountOfField(
      usersWithCountCommentsAndPosts,
      "postsCount"
    );
    const userTheMostComment = findUserMaxCountOfField(
      usersWithCountCommentsAndPosts,
      "commentsCount"
    );

    // Exercise 7
    const usersSortDescByPostsCount = sortUserDescByField(
      usersWithCountCommentsAndPosts,
      "postsCount"
    );

    // Exercise 8
    const postWithComments = await getPostWithCommentsAsync(1);

    // Write result to the json file
    writeResultToFileJson("./result.json", {
      exercise1And2: { users, posts, comments },
      exercise3: usersWithCommentsAndPosts,
      exercise4: usersWithMoreThanThreeComments,
      exercise5: usersWithCountCommentsAndPosts,
      exercise6: {
        userTheMostPost,
        userTheMostComment,
      },
      exercise7: usersSortDescByPostsCount,
      exercise8: postWithComments,
    });
  } catch (error) {
    console.log("Main:", error);
  }
}

main();
