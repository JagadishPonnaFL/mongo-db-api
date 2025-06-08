const mongoose = require("mongoose");

const typeSchema = new mongoose.Schema({
  seriesid: { 
    type: Number, 
    required: true, 
    validate: {
      validator: async function(value) {
        const TypesParent = require("./typesParent");
        const exists = await TypesParent.exists({ series: value });
        return !!exists;
      },
      message: props => `seriesid ${props.value} does not exist in TypesParent`
    }
  },
  typeid: { type: Number, unique: true },
  issubtype: { type: Boolean, required: true, default: false },
  maintypeid: { 
    type: Number,
    required: function() { return this.issubtype; },
    validate: {
      validator: async function(value) {
        if (!this.issubtype) return true;
        // Check if a main type exists with the same seriesid and typeid = maintypeid and issubtype = false
        const exists = await this.constructor.exists({
          seriesid: this.seriesid,
          typeid: value,
          issubtype: false
        });
        return !!exists;
      },
      message: props => `maintypeid ${props.value} does not exist as a main type for this seriesid`
    }
  },
  value: { type: String, required: true },
  text: { type: String, required: true },
});

// Pre-save hook to auto-increment typeid per seriesid and issubtype
typeSchema.pre("save", async function (next) {
  // If issubtype is false, ensure maintypeid is null
  if (!this.issubtype) {
    this.maintypeid = null;
  }

  if (this.isNew) {
    const last = await this.constructor.findOne({ seriesid: this.seriesid, issubtype: this.issubtype,maintypeid:null })
      .sort({ typeid: -1 })
      .select("typeid");
      const sublast = await this.constructor.findOne({ seriesid: this.seriesid, issubtype: true,maintypeid:this.maintypeid })
      .sort({ typeid: -1 })
      .select("maintypeid typeid");
      

      
    this.typeid = last ? (last.typeid + 1) : (!this.issubtype ? this.seriesid + 1 : (sublast? sublast.typeid + 1 : this.maintypeid *10+1));
  }
  next();
});


module.exports = mongoose.model("Type", typeSchema);