import { defineComponent } from "vue-demi2";
import { createUseStyles } from "@yuyi919/vue-jss";

const useStyles = createUseStyles({
  parent: {
    padding: 30,
    "&:hover $child": {
      backgroundColor: "red",
    },
  },
  child: {
    backgroundColor: "blue",
  },
});
defineComponent({
  setup() {
    const classes = useStyles();
    return () => (
      <div class={classes.value.parent}>
        <div class={classes.value.child}>
          Background turns red when the mouse is hover the parent
        </div>
      </div>
    );
  },
});
