//for the enviranment variable
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}


//import the required module
const express = require('express')
const res = require('express/lib/response')
const req = require('express/lib/request');
const bodyParser = require('body-parser');
const ejsMate = require('ejs-mate')
const oracledb = require('oracledb');

//for path and flash
const path = require("path")
const flash = require('connect-flash');
const app = express()
//session required for flash
const session = require('express-session')
const { cookie, redirect, type } = require('express/lib/response');

app.use(session({
  secret: 'DBMS',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));


//express initialization
app.use(express.static(path.join(__dirname, "/public")))
app.use(flash());
app.engine('ejs', ejsMate)

//local variable middleware
app.use(async (req, res, next) => {

  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');

  next()
})

//app engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//setting port
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.render('home')
})


app.get('/accounts', async (req, res) => {

  let connection;
  let result;
  try {
    console.log(process.env.USER)
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `select * from account`
    result = await connection.execute(sql);
    connection.commit();

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went Wrong in DB')
    res.redirect('/')
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.render('account', { result })
      } catch (err) {
        req.flash('error', 'Something went Wrong in DB')
        res.redirect('/')
        console.error(err);
      }
    }
  }

})

app.get('/customer/:id', async (req, res) => {
  const cust_id = req.params.id;
  let result;
  try {
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `select * from customer where cust_id=${cust_id}`
    result = await connection.execute(sql);

  }
  catch (e) {
    console.log(e)
    req.flash('error', 'Somthing Went Wrong in DB')
    res.redirect('/accounts')
  }
  finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.render('customer', { result })
      } catch (err) {
        console.error(err);
      }
    }
  }
})

app.get('/deposit', (req, res) => {
  res.render('deposit')
})
app.post('/deposit', async (req, res) => {
  acc_no = req.body.acc_no;
  pin = req.body.pin;
  damt = req.body.d_amt;
  let connection;
  let result;
  try {
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `select pin from account where acc_no=${acc_no}`
    result = await connection.execute(sql);
    connection.commit();

    if (result) {
      if (result.rows[0][0] == pin) {
        const sql1 = `update account a set balance=a.balance+${damt} where acc_no=${acc_no}`
        result1 = await connection.execute(sql1);
        connection.commit();
      }
      else {
        req.flash('error', 'You Entered Wrong Pin')
        res.redirect('/deposit')
      }

    }

  }
  catch (err) {
    console.error(err);
    req.flash('error', 'Something went Wrong in DB')
    res.redirect('/deposit')
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.redirect('/')
      } catch (err) {
        console.error(err);
      }
    }
  }




})
app.get('/withdraw', (req, res) => {
  res.render('withdraw')
})
app.post('/withdraw', async (req, res) => {
  acc_no = req.body.acc_no;
  pin = req.body.pin;
  wamt = req.body.w_amt;
  let connection;
  let result;
  try {
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `select pin from account where acc_no=${acc_no}`
    result = await connection.execute(sql);
    connection.commit();

    if (result) {
      if (result.rows[0][0] == pin) {
        const sql1 = `update account a set balance=a.balance-${wamt} where acc_no=${acc_no}`
        result1 = await connection.execute(sql1);
        connection.commit();
      }
      else {
        req.flash('error', 'You Entered Wrong Pin')
        res.redirect('/withdraw')
      }
    }

  }
  catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.redirect('/')
      } catch (err) {
        console.error(err);
      }
    }
  }

})


app.get('/balance', (req, res) => {
  res.render('balance');
})
app.post('/balance', async (req, res) => {
  acc_no = req.body.acc_no;
  pin = req.body.pin

  let connection;
  let result1;

  try {
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `select pin from account where acc_no=${acc_no}`
    result = await connection.execute(sql);

    if (result) {
      if (result.rows[0][0] == pin) {
        const sql1 = `select balance from account where acc_no=${acc_no}`
        result1 = await connection.execute(sql1);
        connection.commit();
      }
      else {
        req.flash('error', 'You Entered Wrong Pin')
        res.redirect('/deposit')
      }
    }

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went Wrong in DB')
    res.redirect('/balance')

  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.render('balanceview', { result1 })
      } catch (err) {
        console.error(err);
      }
    }
  }





})

app.get('/creataccount', (req, res) => {
  res.render('createaccount')
})

app.post('/createaccount', async (req, res) => {
  var val = Math.floor(1000 + Math.random() * 9000);
  var val1 = Math.floor(1000 + Math.random() * 9000);
  console.log(val);
  try {
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `insert into  account(acc_no,balance,cust_id,pin) values (${val},${req.body.ini_depo},${val1},${req.body.pin1})`
    result = await connection.execute(sql);
    await connection.commit();

    const sql1 = `insert into customer(cust_id,acc_no,cust_name,address,dob) values(${val1},${val},'${req.body.name}','${req.body.add}',date '${req.body.dob}')`
    result1 = await connection.execute(sql1);
    await connection.commit();

  }
  catch (err) {
    console.error(err);
    req.flash('error', 'Something went Wrong in DB')
    res.redirect('/')
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.redirect('/')
      } catch (err) {
        console.error(err);
      }
    }
  }

})

app.get('/loan', async (req, res) => {
  let connection;
  let result;
  try {
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `select * from loan`
    result = await connection.execute(sql);
    connection.commit();

  }
  catch (err) {
    console.error(err);
    req.flash('error', 'Something went Wrong in DB')
    res.redirect('/')
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.render('loan', { result })
      } catch (err) {
        console.error(err);
      }
    }
  }
})
app.get('/newloan', (req, res) => {
  res.render('newloan')

})
app.post('/newloan', async (req, res) => {
  let connection;
  let result;
  var val = Math.floor(1000 + Math.random() * 9000);
  try {
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `select * from account where acc_no=${req.body.acc_no}`
    result = await connection.execute(sql)
    await connection.commit();

    if (result && result.rows[0][3] == req.body.pin) {
      const sql2 = `update account a set balance=a.balance+${req.body.l_amt} where acc_no=${req.body.acc_no}`
      result3 = await connection.execute(sql2)
      await connection.commit();

      const sql3 = `select acc_no from loan where acc_no=${req.body.acc_no}`
      result2 = await connection.execute(sql3)
      await connection.commit();

      if (result2.rows.length == 0) {
        const sql1 = `insert into loan( LOAN_ID, CUST_ID, ACC_NO, LOAN_AMOUNT) values (${val},${result.rows[0][2]},${req.body.acc_no},${req.body.l_amt})`
        result1 = await connection.execute(sql1)
        await connection.commit();

      }
      else {
        const sql1 = `update loan a set loan_amount=a.loan_amount+${req.body.l_amt} where acc_no=${req.body.acc_no}`
        result1 = await connection.execute(sql1)
        await connection.commit();
      }

    }
    else {
      req.flash('error', 'You Entered the Wrong Pin')
      res.redirect('/')
    }
  }
  catch (err) {
    console.error(err);
    req.flash('error', 'Something went Wrong in DB')
    res.redirect('/')
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.redirect('/')
      } catch (err) {
        console.error(err);
      }
    }
  }

})
app.post('/closeloan/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id)
  let connection
  let result

  try {
    connection = await oracledb.getConnection({ user: process.env.USER, password: process.env.PASSWORD, connectionString: "localhost" });
    console.log("Successfully connected to Oracle Database 10g EX");

    const sql = `delete loan where  loan_id=${id}`
    result = await connection.execute(sql)
    await connection.commit();

  }
  catch (err) {
    console.error(err);
    req.flash('error', 'Something went Wrong in DB')
    res.redirect('/')

  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB Closed");
        res.redirect('/loan')
      } catch (err) {
        console.error(err);
      }
    }
  }

})
//Port entry
app.listen(port, function () {
  console.log("Started")
}
)