const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, "users.json");

function getUsers() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "من فضلك اكتب اسم المستخدم وكلمة المرور"
            });
        }

        const users = getUsers();

        const exists = users.find(
            user => user.username.toLowerCase() === username.toLowerCase()
        );

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "اسم المستخدم موجود بالفعل"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({
            id: Date.now(),
            username: username,
            password: hashedPassword
        });

        saveUsers(users);

        res.json({
            success: true,
            message: "تم إنشاء الحساب بنجاح"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر"
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const users = getUsers();

        const user = users.find(
            user => user.username.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "اسم المستخدم أو كلمة المرور غير صحيحة"
            });
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "اسم المستخدم أو كلمة المرور غير صحيحة"
            });
        }

        res.json({
            success: true,
            message: "تم تسجيل الدخول بنجاح",
            username: user.username
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر"
        });
    }
});

app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("El Faris Amirican Server Running");
    console.log("Open: http://localhost:3000");
    console.log("=================================");
});