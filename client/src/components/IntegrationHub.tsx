/** Animated hub diagram — brand icons via Simple Icons (simpleicons.org) */

const P = {
  todoist:
    'M21 0H3C1.35 0 0 1.35 0 3v3.858s3.854 2.24 4.098 2.38c.31.18.694.177 1.004 0 .26-.147 8.02-4.608 8.136-4.675.279-.161.58-.107.748-.01.164.097.606.348.84.48.232.134.221.502.013.622l-9.712 5.59c-.346.2-.69.204-1.048.002C3.478 10.907.998 9.463 0 8.882v2.02l4.098 2.38c.31.18.694.177 1.004 0 .26-.147 8.02-4.609 8.136-4.676.279-.16.58-.106.748-.008.164.096.606.347.84.48.232.133.221.5.013.62-.208.121-9.288 5.346-9.712 5.59-.346.2-.69.205-1.048.002C3.478 14.951.998 13.506 0 12.926v2.02l4.098 2.38c.31.18.694.177 1.004 0 .26-.147 8.02-4.609 8.136-4.676.279-.16.58-.106.748-.009.164.097.606.348.84.48.232.133.221.502.013.622l-9.712 5.59c-.346.199-.69.204-1.048.001C3.478 18.994.998 17.55 0 16.97V21c0 1.65 1.35 3 3 3h18c1.65 0 3-1.35 3-3V3c0-1.65-1.35-3-3-3z',
  notion:
    'M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z',
  linear:
    'M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z',
  obsidian:
    'M19.355 18.538a68.967 68.959 0 0 0 1.858-2.954.81.81 0 0 0-.062-.9c-.516-.685-1.504-2.075-2.042-3.362-.553-1.321-.636-3.375-.64-4.377a1.707 1.707 0 0 0-.358-1.05l-3.198-4.064a3.744 3.744 0 0 1-.076.543c-.106.503-.307 1.004-.536 1.5-.134.29-.29.6-.446.914l-.31.626c-.516 1.068-.997 2.227-1.132 3.59-.124 1.26.046 2.73.815 4.481.128.011.257.025.386.044a6.363 6.363 0 0 1 3.326 1.505c.916.79 1.744 1.922 2.415 3.5zM8.199 22.569c.073.012.146.02.22.02.78.024 2.095.092 3.16.29.87.16 2.593.64 4.01 1.055 1.083.316 2.198-.548 2.355-1.664.114-.814.33-1.735.725-2.58l-.01.005c-.67-1.87-1.522-3.078-2.416-3.849a5.295 5.295 0 0 0-2.778-1.257c-1.54-.216-2.952.19-3.84.45.532 2.218.368 4.829-1.425 7.531zM5.533 9.938c-.023.1-.056.197-.098.29L2.82 16.059a1.602 1.602 0 0 0 .313 1.772l4.116 4.24c2.103-3.101 1.796-6.02.836-8.3-.728-1.73-1.832-3.081-2.55-3.831zM9.32 14.01c.615-.183 1.606-.465 2.745-.534-.683-1.725-.848-3.233-.716-4.577.154-1.552.7-2.847 1.235-3.95.113-.235.223-.454.328-.664.149-.297.288-.577.419-.86.217-.47.379-.885.46-1.27.08-.38.08-.72-.014-1.043-.095-.325-.297-.675-.68-1.06a1.6 1.6 0 0 0-1.475.36l-4.95 4.452a1.602 1.602 0 0 0-.513.952l-.427 2.83c.672.59 2.328 2.316 3.335 4.711.09.21.175.43.253.653z',
  things3:
    'm15.815 0 1.099.003c.492.01 1.138.013 1.856.165.713.147 1.489.49 2.086 1.04a3.94 3.94 0 0 1 1.167 1.911c.178.664.193 1.264.211 1.722l.021 1.026.016.905.047 2.685.049 2.71.016.925.016 1.055v.071c0 .338-.004.741-.062 1.193l-.636 4.978-.089.495a3.8 3.8 0 0 1-1.064 1.902c-.56.55-1.303.896-1.99 1.044-.693.153-1.32.158-1.796.167L15.698 24H8.3l-1.065-.003c-.477-.01-1.102-.014-1.795-.167-.687-.148-1.43-.494-1.991-1.044a3.8 3.8 0 0 1-1.064-1.902l-.088-.495-.637-4.978a9 9 0 0 1-.06-1.193v-.072l.015-1.054.016-.926.048-2.709.047-2.685.016-.905.02-1.026c.019-.458.034-1.059.212-1.722.173-.658.56-1.37 1.166-1.911.6-.55 1.376-.893 2.089-1.04C5.947.016 6.593.012 7.085.003L8.183 0zm1.625 4.203H6.196c-.149.003-.346.005-.566.051a1.35 1.35 0 0 0-.636.32c-.173.157-.295.36-.353.584-.055.203-.058.386-.063.526l-.005.335-.129 10.284-.003.16.018.017q.135.127.292.229l.039.025.198.105.359.139.344.084.397.064.396.049.257.031.25.035.408.076.188.046.173.052.102.036.098.037c.258.104.421.228.507.341.106.143.114.27.124.368l.011.217.012.255.038.887.039.86.009.2.005.103c.005.046.009.105.06.17s.16.138.335.19l.043.013q.276.072.561.09l.537.017h3.514l.537-.016c.19-.014.397-.044.563-.092l.039-.012c.176-.052.288-.124.337-.19.051-.065.055-.124.06-.17l.006-.104.008-.2.038-.859.038-.887.01-.255.013-.217c.01-.098.018-.225.125-.368.085-.114.25-.238.51-.342l.095-.037.102-.035.174-.052.186-.047.411-.075.247-.035.256-.03.399-.051.399-.063.341-.083.358-.138.195-.104.042-.026q.168-.11.314-.249l-.002-.159-.131-10.284-.006-.335c-.005-.141-.008-.323-.061-.526a1.2 1.2 0 0 0-.353-.584c-.18-.162-.4-.272-.636-.32-.22-.046-.418-.048-.567-.05zm-2.941 13.986-.009.182-.082 1.893h-.003l-.138.017-.023.001-.505.016h-3.485l-.504-.016-.161-.018h-.004l-.082-1.893-.01-.182zm1.427-11.177a.78.78 0 0 1 .722.093.67.67 0 0 1 .251.641c-.045.229-.232.421-.48.723a50 50 0 0 0-3.836 5.257c-.308.575-.593.808-.9.844-.308.037-.64-.123-1.087-.613l-1.824-1.755c-.29-.28-.488-.456-.57-.692a.66.66 0 0 1 .175-.72c.2-.182.512-.233.764-.16.253.074.445.27.741.539l1.546 1.417a51 51 0 0 1 3.844-4.982c.261-.293.425-.502.654-.592',
  clickup:
    'M2 18.439l3.69-2.828c1.961 2.56 4.044 3.739 6.363 3.739 2.307 0 4.33-1.166 6.203-3.704L22 18.405C19.298 22.065 15.941 24 12.053 24 8.178 24 4.788 22.078 2 18.439zM12.04 6.15l-6.568 5.66-3.036-3.52L12.055 0l9.543 8.296-3.05 3.509z',
  jira:
    'M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z',
  asana:
    'M18.78 12.653c-2.882 0-5.22 2.336-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.34 5.22-5.22-2.336-5.22-5.22-5.22zm-13.56 0c-2.88 0-5.22 2.337-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22-2.336-5.22-5.22-5.22zm12-6.525c0 2.883-2.337 5.22-5.22 5.22-2.882 0-5.22-2.337-5.22-5.22 0-2.88 2.338-5.22 5.22-5.22 2.883 0 5.22 2.34 5.22 5.22z',
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  claude:
    'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z',
  icloud:
    'M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z',
  googlecalendar:
    'M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z',
  outlook:
    'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
  reminders:
    'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701',
};

const VW = 1140;
const VH = 780;
const HUB_CX = VW / 2;
const HUB_CY = 390;
const HUB_R = 90;
/** Decorative rings + Claude orbit — scaled with hub radius */
const RING_INNER = 126;
const RING_OUTER = 152;
const RING_CLAUDE = 168;
const CLAUDE_ORBIT_R = RING_CLAUDE;
const CLAUDE_BADGE_R = 24;
const CLAUDE_ICON_SIZE = 17;
const SOURCE_X = 76;
const SOURCE_R = 26;
const SOURCE_LABEL_DY = 40;
/** Vertical gap between source node centers (circle + label need ~72px) */
const SOURCE_STEP = 76;
const SOURCE_START_Y = 88;
const CAL_X = VW - 76;
const CAL_R = 26;
const CAL_STEP = 88;

const SOURCES: [string, string, string][] = [
  ['Todoist', '#ef4444', P.todoist],
  ['Notion', '#e5e5e5', P.notion],
  ['Linear', '#818cf8', P.linear],
  ['Obsidian', '#a78bfa', P.obsidian],
  ['Things 3', '#60a5fa', P.things3],
  ['ClickUp', '#c084fc', P.clickup],
  ['Jira', '#2684ff', P.jira],
  ['Asana', '#f06a6a', P.asana],
  ['GitHub', '#8b949e', P.github],
];

const SOURCE_Y = SOURCES.map((_, i) => SOURCE_START_Y + i * SOURCE_STEP);

const CALENDARS: [string, string, string][] = [
  ['iCloud Cal', '#f87171', P.icloud],
  ['Google Cal', '#93c5fd', P.googlecalendar],
  ['Outlook', '#60a5fa', P.outlook],
  ['Reminders', '#fb923c', P.reminders],
];

/** Calendar column centered on hub (4 nodes, 3 gaps) */
const CAL_Y = CALENDARS.map((_, i) => HUB_CY - 1.5 * CAL_STEP + i * CAL_STEP);
const CAL_HEADER_Y = CAL_Y[0] - 44;

/** Point on hub circle — left arc for sources, right arc for calendars */
function hubPoint(index: number, count: number, side: 'left' | 'right'): { x: number; y: number } {
  const t = count <= 1 ? 0.5 : index / (count - 1);
  const angle =
    side === 'left'
      ? Math.PI + 0.48 - t * 0.96 // wider vertical spread on left arc
      : -0.62 + t * 1.24; // upper-right → lower-right
  return {
    x: HUB_CX + HUB_R * Math.cos(angle),
    y: HUB_CY + HUB_R * Math.sin(angle),
  };
}

/** Edge of circle `cx,cy,r` that faces `fromX,fromY` (for flush connector endpoints) */
function circleEdgeToward(
  cx: number,
  cy: number,
  r: number,
  fromX: number,
  fromY: number
): { x: number; y: number } {
  const dx = fromX - cx;
  const dy = fromY - cy;
  const d = Math.hypot(dx, dy) || 1;
  return { x: cx + (dx / d) * r, y: cy + (dy / d) * r };
}

function sourceToHubPath(sourceY: number, index: number): string {
  const end = hubPoint(index, SOURCES.length, 'left');
  const start = circleEdgeToward(SOURCE_X, sourceY, SOURCE_R, end.x, end.y);
  const span = end.x - start.x;
  const c1x = start.x + span * 0.58;
  const c2x = end.x - span * 0.08;
  return `M ${start.x} ${start.y} C ${c1x} ${start.y} ${c2x} ${end.y} ${end.x} ${end.y}`;
}

function hubToCalPath(calIndex: number, calY: number): string {
  const start = hubPoint(calIndex, CALENDARS.length, 'right');
  const end = circleEdgeToward(CAL_X, calY, CAL_R, start.x, start.y);
  const span = end.x - start.x;
  const c1x = start.x + span * 0.42;
  const c2x = end.x - span * 0.06;
  return `M ${start.x} ${start.y} C ${c1x} ${start.y} ${c2x} ${end.y} ${end.x} ${end.y}`;
}

function Icon({ d, color, size }: { d: string; color: string; size: number }) {
  const s = size / 24;
  return (
    <path
      d={d}
      fill={color}
      opacity={0.9}
      className="ih-icon"
      transform={`translate(${-size / 2},${-size / 2}) scale(${s})`}
    />
  );
}

export default function IntegrationHub() {
  return (
    <div
      className="integration-hub w-full overflow-hidden rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)]"
      style={{ '--ih-hub-cx': `${HUB_CX}px`, '--ih-hub-cy': `${HUB_CY}px` } as React.CSSProperties}
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full h-auto block"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FlowTyme connects task sources to calendars"
      >
        <defs>
          <radialGradient id="ih-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="var(--ih-bg-center)" />
            <stop offset="100%" stopColor="var(--ih-bg-edge)" />
          </radialGradient>
          <radialGradient id="ih-hub" cx="38%" cy="28%" r="90%">
            <stop offset="0%" stopColor="#311b6b" />
            <stop offset="55%" stopColor="#1a1045" />
            <stop offset="100%" stopColor="#0e0b22" />
          </radialGradient>
          <linearGradient id="ih-ftg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <filter id="ih-blur">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <rect width={VW} height={VH} rx="22" fill="url(#ih-bg)" />

        <ellipse cx={HUB_CX} cy={HUB_CY} rx="320" ry="240" fill="#7c3aed" opacity="0.08" filter="url(#ih-blur)" className="ih-pulse" />

        {/* Column titles — above nodes, not overlapping circles */}
        <text x={SOURCE_X} y={24} textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="0.14em" fill="#7c3aed" opacity="0.9">
          TASK SOURCES
        </text>
        <text x={CAL_X} y={CAL_HEADER_Y} textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="0.14em" fill="#0e7490" opacity="0.9">
          CALENDARS &amp;
        </text>
        <text x={CAL_X} y={CAL_HEADER_Y + 12} textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="0.14em" fill="#0e7490" opacity="0.9">
          REMINDERS
        </text>

        {/* Decorative rings (under connection lines) */}
        <circle cx={HUB_CX} cy={HUB_CY} r={RING_OUTER} fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="7 15" opacity="0.28" className="ih-spin-slow" />
        <circle cx={HUB_CX} cy={HUB_CY} r={RING_INNER} fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 22" opacity="0.22" className="ih-spin-rev" />
        <circle cx={HUB_CX} cy={HUB_CY} r={RING_CLAUDE} fill="none" stroke="#D97757" strokeWidth="0.9" strokeDasharray="4 20" opacity="0.28" className="ih-spin-slow" />

        {/* Sources → hub */}
        {SOURCES.map(([, stroke], i) => (
          <path
            key={`s${i}`}
            d={sourceToHubPath(SOURCE_Y[i], i)}
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.55"
            className="ih-flow"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}

        {/* Hub → calendars */}
        {CALENDARS.map(([, stroke], i) => (
          <path
            key={`c${i}`}
            d={hubToCalPath(i, CAL_Y[i])}
            fill="none"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.5"
            className="ih-flow"
            style={{ animationDelay: `${i * 0.4 + 0.15}s` }}
          />
        ))}

        {/* Hub center fill + border */}
        <circle cx={HUB_CX} cy={HUB_CY} r={HUB_R} fill="url(#ih-hub)" />
        <circle cx={HUB_CX} cy={HUB_CY} r={HUB_R} fill="none" stroke="#6d28d9" strokeWidth="1.8" opacity="0.85" />

        {/* Claude Code orbiting badge — sits on outer orange ring */}
        <g className="ih-claude-orbit">
          <g transform={`translate(${HUB_CX},${HUB_CY - CLAUDE_ORBIT_R})`}>
            <circle r={CLAUDE_BADGE_R} fill="var(--ih-claude-bg)" />
            <circle r={CLAUDE_BADGE_R} fill="none" stroke="var(--ih-claude-stroke)" strokeWidth="1.5" className="ih-breathe" />
            <Icon d={P.claude} color="var(--ih-claude-stroke)" size={CLAUDE_ICON_SIZE} />
          </g>
        </g>

        {/* Hub labels */}
        <text x={HUB_CX} y={HUB_CY - 6} textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="800" fill="url(#ih-ftg)">
          FlowTyme
        </text>
        <text x={HUB_CX} y={HUB_CY + 22} textAnchor="middle" fontSize="8.5" fill="var(--ih-label)" letterSpacing="0.14em" fontWeight="600">
          AUTO·SCHEDULE
        </text>
        <text x={HUB_CX} y={HUB_CY + 38} textAnchor="middle" fontSize="6.5" fill="#D97757" letterSpacing="0.13em" fontWeight="700" opacity="0.75">
          CLAUDE CODE
        </text>

        {/* Source nodes */}
        {SOURCES.map(([label, color, iconPath], i) => (
          <g key={label} transform={`translate(${SOURCE_X},${SOURCE_Y[i]})`}>
            <circle r={SOURCE_R} fill="var(--ih-node-bg)" />
            <circle r={SOURCE_R} fill="none" stroke={color} strokeWidth="1.5" className="ih-breathe" />
            <Icon d={iconPath} color={color} size={17} />
            <text y={SOURCE_LABEL_DY} textAnchor="middle" fontSize="9" fill="var(--ih-label)">
              {label}
            </text>
          </g>
        ))}

        {/* Calendar nodes */}
        {CALENDARS.map(([label, color, iconPath], i) => (
          <g key={label} transform={`translate(${CAL_X},${CAL_Y[i]})`}>
            <circle r={CAL_R} fill="var(--ih-node-bg)" />
            <circle r={CAL_R} fill="none" stroke={color} strokeWidth="1.5" className="ih-breathe" />
            <Icon d={iconPath} color={color} size={16} />
            <text y="40" textAnchor="middle" fontSize="9" fill="var(--ih-label)">
              {label}
            </text>
          </g>
        ))}

      </svg>
    </div>
  );
}
