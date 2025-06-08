const mongoose = require('mongoose');
const AutoIncrement = require("mongoose-sequence")(mongoose);

const typesParentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  issubtype: { type: Boolean, required: true, default: false,
    validate: {
      validator:async function(value) {
        if(!value) return true; // If issubtype is false, no need to check series
        const count = await this.constructor.countDocuments({
          series: this.series,
          issubtype: !value,
          _id: { $ne: this._id } // Exclude self on update
        });
        // Allow only if count is 0 (no other with same series and issubtype)
        return count !== 0
      },
      message: "there should be parent with the series."
    }
   },
  name: { type: String, required: true },
  series: { 
    type: Number, 
    required: true,
    validate: {
      validator: async function(value) {
        // Count how many records exist with this series and this issubtype value
        const count = await this.constructor.countDocuments({
          series: value,
          issubtype: this.issubtype,
          _id: { $ne: this._id } // Exclude self on update
        });
        // Allow only if count is 0 (no other with same series and issubtype)
        return count === 0;
      },
      message: "This series already exists for this issubtype value."
    }
  },
});

// Add auto-increment plugin for the id field
typesParentSchema.plugin(AutoIncrement, { inc_field: "id" });

// Cascade delete subtypes when parent is deleted (use post hook for reliability)
typesParentSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.issubtype === false) {
    await doc.constructor.deleteMany({
      series: doc.series,
      issubtype: true
    });
  }
});

module.exports = mongoose.model("TypesParent", typesParentSchema);