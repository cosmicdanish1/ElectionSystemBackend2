-- Purpose: Complete database schema definition script.
-- This file contains SQL commands to create the 'election_system' database
-- and define all tables: users, voter, election, candidate, vote, and sessions.

-- Create the database
CREATE DATABASE IF NOT EXISTS election_system;
USE election_system;

-- USERS: Central user identity for both voters & committee members
CREATE TABLE users (
    userid INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') DEFAULT 'prefer_not_to_say',
    date_of_birth DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('voter', 'committee') DEFAULT 'voter',
    profile_photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userid)
);

-- VOTERS: Voter profile and eligibility
CREATE TABLE voters (
    vid INT NOT NULL AUTO_INCREMENT,
    userid INT NOT NULL UNIQUE,
    aadharid VARCHAR(12) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    nationality ENUM('Indian', 'NRI', 'Non-India') NOT NULL,
    voter_card_id VARCHAR(20) NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (vid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

-- PARTIES: Normalized political party info
CREATE TABLE parties (
    partyid INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    symbol_url VARCHAR(255),
    leader_name VARCHAR(100),
    PRIMARY KEY (partyid)
);

-- ELECTIONS: Types of elections
CREATE TABLE elections (
    electionid INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    type ENUM('Local', 'State', 'National', 'Nagar', 'Lok Sabha', 'Vidhan Sabha') NOT NULL,
    date DATE NOT NULL,
    location_region VARCHAR(100),
    status ENUM('Upcoming', 'Ongoing', 'Completed') DEFAULT 'Upcoming',
    PRIMARY KEY (electionid)
);

-- CANDIDATES: Registered candidates linked to elections
CREATE TABLE candidates (
    cid INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    aadharid VARCHAR(12) NOT NULL UNIQUE,
    dob DATE NOT NULL,
    email VARCHAR(100),
    contact_number VARCHAR(15),
    profile_photo_url VARCHAR(255),
    partyid INT,
    location_region VARCHAR(100),
    symbol_url VARCHAR(255),
    electionid INT NOT NULL,
    added_by INT, -- committee member who added
    is_verified BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cid),
    FOREIGN KEY (partyid) REFERENCES parties(partyid),
    FOREIGN KEY (electionid) REFERENCES elections(electionid),
    FOREIGN KEY (added_by) REFERENCES users(userid)
);

-- VOTES: Voting transactions (1 vote per voter per election)
CREATE TABLE votes (
    voteid INT NOT NULL AUTO_INCREMENT,
    voterid INT NOT NULL,
    candidateid INT NOT NULL,
    electionid INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (voteid),
    FOREIGN KEY (voterid) REFERENCES voters(vid),
    FOREIGN KEY (candidateid) REFERENCES candidates(cid),
    FOREIGN KEY (electionid) REFERENCES elections(electionid),
    UNIQUE (voterid, electionid) -- prevent double voting
);

-- SESSIONS: For authentication persistence (optional)
CREATE TABLE sessions (
    session_id VARCHAR(128) NOT NULL,
    userid INT,
    expires DATETIME NOT NULL,
    data MEDIUMTEXT,
    PRIMARY KEY (session_id),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

INSERT INTO users (name, gender, date_of_birth, email, password, role, profile_photo_url)
VALUES
  ('Ravi Sharma', 'male', '2000-05-15', 'ravi@example.com', 'hashedpass1', 'voter', '/photos/ravi.jpg'),
  ('Anjali Verma', 'female', '1995-08-22', 'anjali@example.com', 'hashedpass2', 'committee', '/photos/anjali.jpg'),
  ('Karan Singh', 'male', '1990-10-10', 'karan@example.com', 'hashedpass3', 'voter', '/photos/karan.jpg');

INSERT INTO voters (userid, aadharid, address, nationality, voter_card_id, is_verified)
VALUES
  (1, '123456789012', 'Bhopal, MP', 'Indian', 'VOTER123MP', TRUE),
  (3, '987654321098', 'Delhi, DL', 'Indian', 'VOTER456DL', TRUE);
  
INSERT INTO parties (name, symbol_url, leader_name)
VALUES
  ('People Party', '/symbols/peopleparty.png', 'Rahul Mehra'),
  ('National Front', '/symbols/nationalfront.png', 'Anita Desai');
  
INSERT INTO elections (title, type, date, location_region, status)
VALUES
  ('State Assembly Elections 2025', 'State', '2025-11-10', 'Madhya Pradesh', 'Upcoming'),
  ('National Elections 2025', 'National', '2025-12-01', 'India', 'Upcoming');
  
INSERT INTO candidates (name, gender, aadharid, dob, email, contact_number, profile_photo_url, partyid, location_region, symbol_url, electionid, added_by, is_verified, status)
VALUES
  ('Pooja Patel', 'Female', '222333444555', '1985-04-10', 'pooja@party.com', '9123456789', '/photos/pooja.jpg', 1, 'Bhopal', '/symbols/star.png', 1, 2, TRUE, 'approved'),
  ('Amit Thakur', 'Male', '555444333222', '1980-01-20', 'amit@front.com', '9876543210', '/photos/amit.jpg', 2, 'Bhopal', '/symbols/leaf.png', 1, 2, TRUE, 'approved');

INSERT INTO votes (voterid, candidateid, electionid)
VALUES
  (1, 1, 1),
  (2, 2, 1);
  
INSERT INTO sessions (session_id, userid, expires, data)
VALUES
  ('sess123', 1, '2025-07-01 23:59:59', 'session_data_here'),
  ('sess456', 2, '2025-07-01 23:59:59', 'session_data_here');
  
SELECT * FROM users;

SELECT u.name, v.aadharid, v.voter_card_id, v.address
FROM users u
JOIN voters v ON u.userid = v.userid;

SELECT e.title AS election, c.name AS candidate, p.name AS party
FROM candidates c
JOIN elections e ON c.electionid = e.electionid
LEFT JOIN parties p ON c.partyid = p.partyid;

SELECT u.name AS voter, c.name AS candidate, e.title AS election
FROM votes v
JOIN voters vr ON v.voterid = vr.vid
JOIN users u ON vr.userid = u.userid
JOIN candidates c ON v.candidateid = c.cid
JOIN elections e ON v.electionid = e.electionid; 