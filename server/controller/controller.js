const Contacts = require("../model/model");
const path = require("path");
const multer = require("multer");
// const { error } = require("console");

// configuring multer storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "avatars");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// creating an instance of multer
const upload = multer({ storage: storage }).single("avatar");

// post new contacts
exports.create = (req, res) => {
    // console.log(req.body);
    upload(req, res, async (error) => {
        if (error instanceof multer.MulterError) {
            return req.status(400).json({ error: "image error" + error });
        } else if (error) {
            return res.status(500).json({ error: "server error" + error });
        } else {
            // validating fields
            const requiredFields = ["firstName", "lastName", "email", "phone", "status"];

            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res
                        .status(400)
                        .json({ message: `${field} is required` });
                }
            }

            const avatarPath = req.file ? req.file.path : null;

            const contact = new Contacts({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                status: req.body.status,
                avatar: avatarPath,
            });

            // save contacts in database
            contact
                .save(contact)
                .then((data) => {
                    res.send(data);
                })
                .catch((err) => {
                    res.status(500).send({
                        message: "something went wrong" + err,
                    });
                });
        }
    });
};

// get one or all contacts
exports.read = (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    // const tab = req.query.tab;
    // console.log(page, limit, tab);

    if (req.query.id) {
        const id = req.query.id;
        Contacts.findById(id)
            .then((data) => {
                if (!data) {
                    res.status(400).send({
                        message: `contact with id ${id} not found`,
                    });
                } else {
                    res.send(data);
                }
            })
            .catch((err) => {
                res.status(500).send({ message: "error fetching data" });
            });
    } else if (req.query.tab) {
        // console.log(req.query.tab);
        const query = req.query.tab.toString();
        Contacts.find({
            $or: [
                { status: { $regex: new RegExp(query, "i") } },
            ],
        })
            .exec()
            .then((data) => {
                res.json({
                    data: data,
                    length: data.length,
                });
            })
            .catch((error) => {
                res.status(500).json({ error: "internal server error" });
            });
    } else {
        Contacts.countDocuments()
            .exec()
            .then((totalCount) => {
                Contacts.find()
                    .then((contacts) => {
                        contacts.reverse();

                        const slicedData = contacts.slice(skip, skip + limit);

                        res.status(200).json({
                            message: "ok",
                            length: totalCount,
                            data: slicedData,
                        });
                    })
                    .catch((err) => {
                        res.status(500).send({
                            message: "some error occured while fetching data",
                        });
                    });
            });
    }
};

// update a contact
exports.update = (req, res) => {
    upload(req, res, async (error) => {
        if (error instanceof multer.MulterError) {
            res.status(400).json({ error: "image upload error" });
        } else if (error) {
            res.status(500).json({ error: "server error" });
        }

        const avatarPath = req.file ? req.file.path : null;

        const contact = await Contacts.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ error: "contact not found" });
        }

        // update data with new avatar
        const updateData = {
            ...req.body,
        };
        console.log('body', updateData);
        if (avatarPath) {
            updateData.avatar = avatarPath;
        }

        const updatedContact = await Contacts.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.status(200).json({ message: "contact updated", updateData });
    });
};

// delete a contact
exports.delete = (req, res) => {
    const id = req.params.id;

    Contacts.findByIdAndDelete(id)
        .then((data) => {
            if (!data) {
                res.status(404).json({
                    message: `cannot find contact with id ${id}`,
                });
            } else {
                res.send({ message: "contact was deleted successfully", id });
            }
        })
        .catch((error) => {
            res.status(500).json({
                message: `could not delete contact with id ${id}`,
            });
        });
};

// search
exports.search = (req, res) => {
    const page =  1;
    const limit =  5;
    const skip = (page - 1) * limit;

    const query = req.query.q.toString();

    Contacts.find({
        $or: [
            { firstName: { $regex: new RegExp(query, "i") } },
            { lastName: { $regex: new RegExp(query, "i") } },
            { email: { $regex: new RegExp(query, "i") } },
            { phone: { $regex: new RegExp(query, "i") } },
        ],
    })
        .exec()
        .then((data) => {

            const slicedData = data.slice(skip, skip + limit);

            res.json({
                data: slicedData,
                length: data.length,
            });
        })
        .catch((error) => {
            res.status(500).json({ error: "internal server error" });
        });
};
