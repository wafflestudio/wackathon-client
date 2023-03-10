import styles from "./TeamItem.module.scss";
import { Team } from "../../../entities/team/team";
import classNames from "classnames/bind";
import { useEffect, useState } from "react";
import ReactParallaxTilt from "react-parallax-tilt";
import { getTeam, postApplyTeam } from "../../../api/team";
import { sendToast } from "../../../store/useToast";
import useTeams from "../../../store/useTeams";
import { UserInfo } from "../../../entities/user/user";
import useUser from "../../../store/useUser";
import { Application } from "../../../entities/applications";
import {getUsers} from "../../../api/user";
import useUsers from "../../../store/useUsers";

const cx = classNames.bind(styles);

type Props = {
  team: Team;
  isMine: boolean;
  canApply: boolean;
  full: boolean;
};

const checkApplied = (applications: Application[], id: number) => {
  return (
    applications
      .map((application) => application.user)
      .filter((user) => user.id === id).length > 0
  );
};

const TeamItem = ({ team, isMine, canApply, full }: Props) => {
  const { id, name, maxMembers, resolution } = team;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [members, setMembers] = useState<UserInfo[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  const user = useUser((state) => state);
  const getAllTeamsFromServer = useTeams(
    (state) => state.getAllTeamsFromServer,
  );
  const getAllUsersFromServer = useUsers(
      (state) => state.getAllUsersFromServer,
  );
  useEffect(() => {
    if (id === 0) {
      getUsers().then((res) => {
        setMembers(res.filter((x) => x.id > 7 && x.team_id === null));
        setApplications([]);
      })
    }
    else {
      getTeam(id).then((res) => {
        setMembers(res.members);
        setApplications(res.applications);
      });
    }
  }, [isOpen]);

  return (
    <ReactParallaxTilt
      tiltReverse={true}
      perspective={5000}
      tiltMaxAngleX={10}
      tiltMaxAngleY={6}
    >
      <li className={cx("TeamItem", { open: isOpen })}>
        <section
          className={cx("main")}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <div className={cx("label")}>??? ???</div>
          <div className={cx("teamName")}>{name}</div>
          <div className={cx("amount")}>
            ??????: <span className={cx("number")}> {members.length}</span>
            <span className={cx("slash")}>/</span>
            <span className={cx("number")}> {maxMembers}</span>
          </div>
        </section>
        {isOpen && (
          <section className={cx("more")}>
            <div className={cx("label")}>??????</div>
            <div className={cx("resolution")}>{resolution}</div>
            <div className={cx("divider")} />
            <div className={cx("label")}>??????</div>
            <div className={cx("members")}>
              {members.map(
                ({ username, fullname, id: memberId, positions }) => (
                  <div key={memberId} className={cx("member")}>
                    <div className={cx("username")}>{fullname}</div>
                    <div className={cx("id")}>{username}</div>
                    <div className={cx("positions")}>
                      {positions.map((position) => (
                        <div className={cx("position")} key={position}>
                          {position}
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className={cx("divider")} />
            <div className={cx("label")}>????????????</div>
            {isMine && (
              <div className={cx("warning")}>??? ?????? ??????????????????</div>
            )}
            {!isMine && !canApply && (
              <div className={cx("warning")}>
                {(id === 0) ? "??? ?????? ???????????? ?????? ?????? ???????????? ????????????." : "?????? ?????? ?????? ?????? ????????? ??? ????????????"}
              </div>
            )}
            {!isMine &&
              canApply &&
              checkApplied(applications, user.isSignedIn ? user.id : -1) && (
                <div className={cx("warning")}>????????? ?????????????????????</div>
              )}
            {!isMine &&
              canApply &&
              !checkApplied(applications, user.isSignedIn ? user.id : -1) &&
              full && <div className={cx("warning")}>????????? ?????? ????????????</div>}
            {!isMine &&
              canApply &&
              !checkApplied(applications, user.isSignedIn ? user.id : -1) &&
              !full && (
                <div className={cx("apply")}>
                  <div className={cx("askComment")}>
                    ???????????? ?????? ????????? ???????????? ??????????????????!
                  </div>
                  <form
                    className={"applyForm"}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (comment.length < 1) {
                        sendToast("????????? ??????????????????", "warn");
                        return null;
                      }
                      postApplyTeam(id, { comment }).then(
                        (res) => {
                          if (res.success) {
                            sendToast("????????? ?????????????????????", "success");
                            getAllTeamsFromServer();
                            getAllUsersFromServer();
                            setIsOpen(false);
                          }
                        },
                        () => {},
                      );
                    }}
                  >
                    <input
                      type="text"
                      className={cx("commentInput")}
                      placeholder="??? ??? ??????"
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                      }}
                    />

                    <input type="submit" className={cx("commentSubmit")} />
                  </form>
                </div>
              )}
            <div className={cx("current")}>
              ?????? {applications.length}?????? ??????????????????
            </div>
          </section>
        )}
      </li>
    </ReactParallaxTilt>
  );
};

export default TeamItem;
